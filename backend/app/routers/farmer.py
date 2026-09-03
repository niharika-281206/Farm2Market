from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List
from datetime import datetime
import uuid

from app.database.session import get_db
from app.models.all_models import Booking, Slot, Crop, QueueEntry, BookingStatus, User, ProcurementCentre, Payment, Procurement, ProcurementCompany, CompanyApprovalStatus
from app.schemas.all_schemas import BookingCreate, BookingResponse, FarmerResponse, QueueStatusResponse, PaymentResponse, FarmerUpdate, ProcurementResponse
from app.routers.company import ProcurementCompanyResponse
from app.middleware.auth import get_current_farmer
from app.websocket.server import broadcast_queue_update, broadcast_queue_event

router = APIRouter(prefix="/api/v1/farmer", tags=["farmer"])

@router.get("/profile", response_model=FarmerResponse)
def get_farmer_profile(user: User = Depends(get_current_farmer)):
    return user.farmer

def generate_unique_token(db: Session):
    while True:
        token = f"PDC-{str(uuid.uuid4().hex[:6]).upper()}"
        existing = db.query(Booking).filter(Booking.token_number == token).first()
        if not existing:
            return token

@router.post("/bookings", response_model=BookingResponse)
def create_booking(booking_data: BookingCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), user: User = Depends(get_current_farmer)):
    try:
        # Check if slot exists and has capacity
        slot = db.query(Slot).filter(Slot.id == booking_data.slot_id).with_for_update().first()
        if not slot or slot.status != "ACTIVE":
            raise HTTPException(status_code=400, detail="Invalid slot")
        
        if slot.booked_count >= slot.capacity:
            raise HTTPException(status_code=400, detail="Slot is fully booked")
            
        # Generate unique token safely
        token = generate_unique_token(db)
        qr_ref = str(uuid.uuid4())
        
        # Create booking
        booking = Booking(
            farmer_id=user.farmer.id,
            centre_id=booking_data.centre_id,
            slot_id=booking_data.slot_id,
            crop_id=booking_data.crop_id,
            expected_quantity=booking_data.expected_quantity,
            token_number=token,
            qr_reference=qr_ref,
            status=BookingStatus.BOOKED
        )
        db.add(booking)
        
        # Update slot count
        slot.booked_count += 1
        db.flush()
        
        # Determine queue position (next in line for this centre's slot)
        last_queue = db.query(QueueEntry).filter(
            QueueEntry.centre_id == booking_data.centre_id,
        ).order_by(QueueEntry.queue_position.desc().nulls_last()).first()
        next_position = (last_queue.queue_position + 1) if last_queue and last_queue.queue_position else 1
        
        # Add to queue as BOOKED
        queue_entry = QueueEntry(
            booking_id=booking.id,
            centre_id=booking_data.centre_id,
            status=BookingStatus.BOOKED,
            queue_position=next_position
        )
        db.add(queue_entry)
        db.commit()
        db.refresh(booking)
        
        # Broadcast event asynchronously
        background_tasks.add_task(broadcast_queue_event, booking.centre_id, "booking:created", {"booking_id": booking.id, "token_number": token})
        
        return booking
    except HTTPException:
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Booking failed. Please try again.")

@router.get("/bookings", response_model=List[BookingResponse])
def get_farmer_bookings(db: Session = Depends(get_db), user: User = Depends(get_current_farmer)):
    bookings = db.query(Booking).filter(Booking.farmer_id == user.farmer.id).order_by(Booking.created_at.desc()).all()
    return bookings

@router.get("/bookings/{booking_id}/queue-status", response_model=QueueStatusResponse)
def get_queue_status(booking_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_farmer)):
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.farmer_id == user.farmer.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    q_entry = booking.queue_entry
    if not q_entry:
        raise HTTPException(status_code=404, detail="Queue entry not found")
        
    people_ahead = 0
    estimated_wait = 0
    
    if q_entry.status in [BookingStatus.WAITING, BookingStatus.ARRIVED]:
        people_ahead = db.query(QueueEntry).filter(
            QueueEntry.centre_id == booking.centre_id,
            QueueEntry.status.in_([BookingStatus.WAITING, BookingStatus.ARRIVED]),
            QueueEntry.queue_position < q_entry.queue_position
        ).count()
        
        # Calculate wait time dynamically based on active counters
        from app.models.all_models import CentreCounter
        active_counters = db.query(CentreCounter).filter(
            CentreCounter.centre_id == booking.centre_id,
            CentreCounter.is_active == True
        ).count()
        
        # Avoid division by zero, assume at least 1 counter if none active
        divisor = active_counters if active_counters > 0 else 1
        
        # Assume 15 mins processing time per person (more realistic for digital weighing + quality check)
        estimated_wait = (people_ahead * 15) // divisor
        
    current = db.query(QueueEntry).filter(
        QueueEntry.centre_id == booking.centre_id,
        QueueEntry.status.in_([BookingStatus.CALLED, BookingStatus.PROCESSING])
    ).first()
    
    current_token = current.booking.token_number if current else None
    
    return {
        "queue_position": q_entry.queue_position or 0,
        "people_ahead": people_ahead,
        "estimated_wait_minutes": estimated_wait,
        "status": q_entry.status.value,
        "current_token": current_token
    }

@router.get("/buyers", response_model=List[ProcurementCompanyResponse])
def get_private_buyers(db: Session = Depends(get_db)):
    """Fetch approved private procurement companies (buyers) for the nearby centres map."""
    buyers = db.query(ProcurementCompany).filter(
        ProcurementCompany.approval_status == CompanyApprovalStatus.APPROVED,
        ProcurementCompany.active_status == True
    ).all()
    return buyers

@router.get("/payments", response_model=List[PaymentResponse])
def get_farmer_payments(db: Session = Depends(get_db), user: User = Depends(get_current_farmer)):
    payments = db.query(Payment).join(Procurement).join(Booking).filter(
        Booking.farmer_id == user.farmer.id
    ).order_by(Payment.created_at.desc()).all()
    return payments

@router.put("/profile", response_model=FarmerResponse)
def update_farmer_profile(data: FarmerUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_farmer)):
    farmer = user.farmer
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer profile not found")
        
    update_data = data.model_dump(exclude_unset=True)
    
    if "mobile" in update_data:
        new_mobile = update_data.pop("mobile")
        if new_mobile != user.mobile:
            existing = db.query(User).filter(User.mobile == new_mobile).first()
            if existing:
                raise HTTPException(status_code=400, detail="Mobile number already registered to another account")
            user.mobile = new_mobile

    for key, value in update_data.items():
        setattr(farmer, key, value)
        
    db.commit()
    db.refresh(farmer)
    return farmer

@router.get("/procurement", response_model=List[ProcurementResponse])
def get_farmer_procurement(db: Session = Depends(get_db), user: User = Depends(get_current_farmer)):
    procurements = db.query(Procurement).join(Booking).filter(
        Booking.farmer_id == user.farmer.id
    ).order_by(Procurement.id.desc()).all()
    return procurements
