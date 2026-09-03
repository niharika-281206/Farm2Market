from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.database.session import get_db
from app.models.all_models import Booking, QueueEntry, Procurement, Payment, BookingStatus, User
from app.schemas.all_schemas import QueueEntryResponse, QueueEntryWithBookingResponse, ProcurementCreate, ProcurementResponse, PaymentUpdate, PaymentResponse, BookingResponse
from app.middleware.auth import get_current_operator
from app.websocket.server import broadcast_queue_update, broadcast_queue_event

router = APIRouter(prefix="/api/v1/operator", tags=["operator"])

class QueueStatusUpdate(BaseModel):
    status: str
    remarks: Optional[str] = None

@router.get("/queue", response_model=List[QueueEntryWithBookingResponse])
def get_centre_queue(db: Session = Depends(get_db), user: User = Depends(get_current_operator)):
    centre_id = user.operator.centre_id
    entries = db.query(QueueEntry).options(
        joinedload(QueueEntry.booking).joinedload(Booking.farmer),
        joinedload(QueueEntry.booking).joinedload(Booking.centre),
        joinedload(QueueEntry.booking).joinedload(Booking.slot),
        joinedload(QueueEntry.booking).joinedload(Booking.crop),
    ).filter(QueueEntry.centre_id == centre_id).order_by(QueueEntry.queue_position.asc()).all()
    return entries

@router.get("/bookings/verify/{reference}", response_model=BookingResponse)
def verify_booking(reference: str, db: Session = Depends(get_db), user: User = Depends(get_current_operator)):
    booking = db.query(Booking).filter(
        (Booking.qr_reference == reference) | (Booking.token_number == reference),
        Booking.centre_id == user.operator.centre_id
    ).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found for this centre")
        
    return booking

@router.post("/bookings/{token_number}/arrive", response_model=QueueEntryResponse)
def mark_farmer_arrived(token_number: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db), user: User = Depends(get_current_operator)):
    booking = db.query(Booking).filter(Booking.token_number == token_number, Booking.centre_id == user.operator.centre_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found or not for this centre")
        
    if booking.status != BookingStatus.BOOKED:
        raise HTTPException(status_code=400, detail=f"Booking status is {booking.status}, cannot mark arrived")
        
    booking.status = BookingStatus.ARRIVED
    queue_entry = booking.queue_entry
    queue_entry.status = BookingStatus.ARRIVED
    queue_entry.arrived_at = datetime.utcnow()
    
    # Assign position (simple logic: end of queue)
    last_entry = db.query(QueueEntry).filter(
        QueueEntry.centre_id == user.operator.centre_id,
        QueueEntry.status.in_([BookingStatus.ARRIVED, BookingStatus.WAITING])
    ).order_by(QueueEntry.queue_position.desc()).first()
    
    queue_entry.queue_position = (last_entry.queue_position + 1) if last_entry and last_entry.queue_position else 1
    queue_entry.status = BookingStatus.WAITING
    booking.status = BookingStatus.WAITING
    
    db.commit()
    db.refresh(queue_entry)
    
    background_tasks.add_task(broadcast_queue_event, user.operator.centre_id, "queue:arrived", {"booking_id": booking.id, "token_number": booking.token_number})
    return queue_entry

@router.post("/queue/call-next", response_model=QueueEntryResponse)
def call_next(background_tasks: BackgroundTasks, db: Session = Depends(get_db), user: User = Depends(get_current_operator)):
    # Find next WAITING with for update
    next_entry = db.query(QueueEntry).filter(
        QueueEntry.centre_id == user.operator.centre_id,
        QueueEntry.status == BookingStatus.WAITING
    ).order_by(QueueEntry.queue_position.asc()).with_for_update().first()
    
    if not next_entry:
        raise HTTPException(status_code=404, detail="No farmers waiting in queue")
        
    next_entry.status = BookingStatus.CALLED
    next_entry.called_at = datetime.utcnow()
    next_entry.booking.status = BookingStatus.CALLED
    
    db.commit()
    db.refresh(next_entry)
    
    background_tasks.add_task(broadcast_queue_event, user.operator.centre_id, "queue:called", {"booking_id": next_entry.booking.id, "token_number": next_entry.booking.token_number})
    return next_entry

@router.post("/procurement/{token_number}", response_model=ProcurementResponse)
def start_procurement(token_number: str, data: ProcurementCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), user: User = Depends(get_current_operator)):
    booking = db.query(Booking).filter(Booking.token_number == token_number, Booking.centre_id == user.operator.centre_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Prevent duplicate procurement
    if booking.procurement:
        raise HTTPException(status_code=400, detail="Procurement already completed for this booking")
        
    booking.status = BookingStatus.COMPLETED
    booking.queue_entry.status = BookingStatus.COMPLETED
    booking.queue_entry.completed_at = datetime.utcnow()
    
    rate = booking.crop.rate
    total_amount = data.actual_quantity * rate
    
    procurement = Procurement(
        booking_id=booking.id,
        expected_quantity=booking.expected_quantity,
        actual_quantity=data.actual_quantity,
        rate=rate,
        total_amount=total_amount,
        status="COMPLETED"
    )
    db.add(procurement)
    db.flush()
    
    payment = Payment(
        procurement_id=procurement.id,
        amount=total_amount,
        status="PENDING"
    )
    db.add(payment)
    db.commit()
    db.refresh(procurement)
    
    background_tasks.add_task(broadcast_queue_event, user.operator.centre_id, "queue:completed", {"booking_id": booking.id, "token_number": booking.token_number})
    return procurement

@router.post("/payment/{token_number}", response_model=PaymentResponse)
def update_payment(token_number: str, data: PaymentUpdate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), user: User = Depends(get_current_operator)):
    booking = db.query(Booking).filter(Booking.token_number == token_number, Booking.centre_id == user.operator.centre_id).first()
    if not booking or not booking.procurement:
        raise HTTPException(status_code=404, detail="Procurement not found for this booking")
        
    payment = booking.procurement.payment
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")
        
    payment.status = data.status
    if data.transaction_id:
        payment.transaction_id = data.transaction_id
    
    if data.status == "COMPLETED":
        payment.paid_at = datetime.utcnow()
        
    # Store notification for Farmer
    from app.models.all_models import Notification
    notification = Notification(
        user_id=booking.farmer.user_id,
        title="Payment Update",
        message=f"Your payment of Rs. {payment.amount} has been updated to {payment.status}. Transaction Ref: {payment.transaction_id or 'N/A'}",
        type="PAYMENT"
    )
    db.add(notification)
    db.commit()
    db.refresh(payment)
    
    # Broadcast Payment Update and Notification to Farmer
    background_tasks.add_task(broadcast_queue_event, user.operator.centre_id, "payment:updated", {"token_number": booking.token_number, "status": payment.status})
    
    return payment

@router.put("/queue/{token_number}/status", response_model=QueueEntryResponse)
def update_queue_status(token_number: str, data: QueueStatusUpdate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), user: User = Depends(get_current_operator)):
    booking = db.query(Booking).filter(Booking.token_number == token_number, Booking.centre_id == user.operator.centre_id).first()
    if not booking or not booking.queue_entry:
        raise HTTPException(status_code=404, detail="Booking or queue entry not found")
        
    booking.queue_entry.status = data.status
    booking.status = data.status
    if data.remarks:
        booking.queue_entry.notes = data.remarks
        
    db.commit()
    db.refresh(booking.queue_entry)
    
    background_tasks.add_task(broadcast_queue_event, user.operator.centre_id, "queue:updated", {"token_number": token_number, "status": data.status})
    return booking.queue_entry
