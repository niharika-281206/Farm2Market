import sys
import os
import uuid
import random
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from datetime import datetime, timedelta
from app.database.session import SessionLocal
from app.models.all_models import User, UserRole, ProcurementCentre, Crop, Slot, Operator, Admin, Farmer, Booking, QueueEntry, BookingStatus, CentreCounter, ProcurementCompany, CompanyCropRequirement, CompanyApprovalStatus, Procurement, Payment, Notification, AuditLog
from app.core.security import get_password_hash

def seed_db():
    db = SessionLocal()
    
    # Check if already seeded
    if db.query(User).first():
        print("Database already seeded! Please delete sih.db and run migrations again if you want fresh data.")
        return

    print("Seeding database...")
    
    # Create Admin
    admin_user = User(role=UserRole.ADMIN, email="admin@demo.com", password_hash=get_password_hash("password123"))
    db.add(admin_user)
    db.flush()
    db.add(Admin(user_id=admin_user.id, admin_id="ADM-001"))
    
    # Create Centres
    centres = [
        ProcurementCentre(name="Sri Lakshmi Procurement Centre", address="123 Main St", village="Anantapur", district="Anantapur", state="Andhra Pradesh", daily_capacity=100, latitude=14.6819, longitude=77.6006),
        ProcurementCentre(name="Kisan Seva Centre", address="456 Highway", village="Guntur", district="Guntur", state="Andhra Pradesh", daily_capacity=150, latitude=16.3067, longitude=80.4365),
        ProcurementCentre(name="Godavari Green Center", address="789 Riverside", village="Rajahmundry", district="East Godavari", state="Andhra Pradesh", daily_capacity=200, latitude=17.0005, longitude=81.8040)
    ]
    for c in centres:
        db.add(c)
    db.flush()
    
    # Create Counters for Centre 1
    db.add(CentreCounter(centre_id=centres[0].id, name="Counter 1"))
    db.add(CentreCounter(centre_id=centres[0].id, name="Counter 2"))
    
    # Create Operators
    op_users = []
    for i in range(1, 4):
        op_user = User(role=UserRole.OPERATOR, password_hash=get_password_hash("password123"), mobile=f"999999999{i}")
        db.add(op_user)
        db.flush()
        db.add(Operator(user_id=op_user.id, operator_id=f"OP-10{i}", centre_id=centres[i-1].id))
        op_users.append(op_user)
    
    # Create Crops
    crops = [
        Crop(name="Paddy (Grade A)", rate=2300),
        Crop(name="Cotton", rate=6500),
        Crop(name="Maize", rate=1850)
    ]
    for c in crops:
        db.add(c)
    db.flush()
    
    today = datetime.utcnow()
    
    # Create Slots
    slots = []
    for c in centres:
        for day_offset in range(3):
            slot_date = today + timedelta(days=day_offset)
            s1 = Slot(centre_id=c.id, date=slot_date, start_time="09:00 AM", end_time="11:00 AM", capacity=20)
            s2 = Slot(centre_id=c.id, date=slot_date, start_time="11:00 AM", end_time="01:00 PM", capacity=20)
            db.add(s1)
            db.add(s2)
            slots.append(s1)
            slots.append(s2)
    db.flush()

    # Create Farmers
    farmers = []
    for i in range(1, 15):
        f_user = User(role=UserRole.FARMER, mobile=f"88888888{i:02d}")
        db.add(f_user)
        db.flush()
        farmer = Farmer(user_id=f_user.id, farmer_id=f"FMR-10{i}", name=f"Farmer {i}", email=f"farmer{i}@demo.com", village="Village X", mandal="Mandal Y", district="District Y", state="AP", pincode="515001", land_area=5.0, primary_crops="Paddy", preferred_centre_id=centres[0].id)
        db.add(farmer)
        farmers.append(farmer)
    db.flush()
    
    # Create Bookings and Queue Entries
    slot1 = slots[0]
    for i in range(10):
        farmer = farmers[i]
        booking = Booking(
            farmer_id=farmer.id,
            centre_id=slot1.centre_id,
            slot_id=slot1.id,
            crop_id=crops[0].id,
            expected_quantity=float(random.randint(10, 50)),
            token_number=f"PDC-A{i:03d}",
            qr_reference=str(uuid.uuid4()),
            status=BookingStatus.BOOKED
        )
        db.add(booking)
        db.flush()
        slot1.booked_count += 1
        
        q_status = BookingStatus.BOOKED
        if i < 2:
            q_status = BookingStatus.COMPLETED
            booking.status = BookingStatus.COMPLETED
        elif i < 4:
            q_status = BookingStatus.WAITING
            booking.status = BookingStatus.WAITING
        elif i == 4:
            q_status = BookingStatus.CALLED
            booking.status = BookingStatus.CALLED
            
        qe = QueueEntry(
            booking_id=booking.id,
            centre_id=booking.centre_id,
            status=q_status,
            queue_position=i+1
        )
        db.add(qe)
        
        # If completed, add procurement and payment
        if q_status == BookingStatus.COMPLETED:
            procurement = Procurement(
                booking_id=booking.id,
                expected_quantity=booking.expected_quantity,
                actual_quantity=booking.expected_quantity,
                rate=crops[0].rate,
                total_amount=booking.expected_quantity * crops[0].rate,
                status="COMPLETED"
            )
            db.add(procurement)
            db.flush()
            
            payment = Payment(
                procurement_id=procurement.id,
                amount=procurement.total_amount,
                status="COMPLETED",
                paid_at=datetime.utcnow()
            )
            db.add(payment)
            
            notification = Notification(
                user_id=farmer.user_id,
                title="Payment Credited",
                message=f"Payment of Rs. {payment.amount} has been credited to your account.",
                type="PAYMENT"
            )
            db.add(notification)

    # Create a Procurement Company
    comp_user = User(role=UserRole.PROCUREMENT_COMPANY, email="company@demo.com", mobile="7777777777", password_hash=get_password_hash("password123"))
    db.add(comp_user)
    db.flush()
    
    company = ProcurementCompany(
        user_id=comp_user.id,
        owner_name="Rajesh Kumar",
        company_name="AgriCorp India",
        registration_number="REG-2023-456",
        address="Plot 45, Industrial Area",
        village="Guntur Rural",
        district="Guntur",
        state="Andhra Pradesh",
        pincode="522001",
        latitude=16.3067,
        longitude=80.4365,
        approval_status=CompanyApprovalStatus.APPROVED,
        active_status=True
    )
    db.add(company)
    db.flush()
    
    comp_crop = CompanyCropRequirement(
        company_id=company.id,
        crop_id=crops[0].id,
        maximum_quantity=5000,
        procurement_rate=2350
    )
    db.add(comp_crop)

    # Add some Audit Logs
    log = AuditLog(
        user_id=admin_user.id,
        role="ADMIN",
        action="COMPANY_APPROVED",
        entity="ProcurementCompany",
        entity_id=str(company.id),
        metadata_json='{"status": "APPROVED"}'
    )
    db.add(log)
        
    db.commit()
    print("Seeding complete! Admin: admin@demo.com / password123, Operator: OP-101 / password123, Company: company@demo.com / password123")

if __name__ == "__main__":
    seed_db()
