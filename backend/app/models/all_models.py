import datetime
import enum
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.session import Base

class UserRole(str, enum.Enum):
    FARMER = "FARMER"
    OPERATOR = "OPERATOR"
    ADMIN = "ADMIN"
    PROCUREMENT_COMPANY = "PROCUREMENT_COMPANY"

class CompanyApprovalStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    SUSPENDED = "SUSPENDED"

class BookingStatus(str, enum.Enum):
    BOOKED = "BOOKED"
    ARRIVED = "ARRIVED"
    WAITING = "WAITING"
    CALLED = "CALLED"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    SKIPPED = "SKIPPED"
    NO_SHOW = "NO_SHOW"
    CANCELLED = "CANCELLED"

class ProcurementStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"

class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    role = Column(Enum(UserRole), index=True, nullable=False)
    mobile = Column(String(15), unique=True, index=True, nullable=True)
    email = Column(String(100), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    email_verified = Column(Boolean, default=False)
    email_verified_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    farmer = relationship("Farmer", back_populates="user", uselist=False)
    operator = relationship("Operator", back_populates="user", uselist=False)
    admin = relationship("Admin", back_populates="user", uselist=False)
    procurement_company = relationship("ProcurementCompany", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")

class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    farmer_id = Column(String(50), unique=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=True)
    village = Column(String(100))
    mandal = Column(String(100))
    district = Column(String(100))
    state = Column(String(100))
    pincode = Column(String(20))
    land_area = Column(Float, nullable=True)
    primary_crops = Column(String(255), nullable=True)
    other_crops = Column(String(255), nullable=True)
    preferred_centre_id = Column(Integer, ForeignKey("procurement_centres.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="farmer")
    bookings = relationship("Booking", back_populates="farmer")

    @property
    def mobile(self):
        return self.user.mobile if self.user else None

class ProcurementCentre(Base):
    __tablename__ = "procurement_centres"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    address = Column(Text)
    village = Column(String(100))
    district = Column(String(100))
    state = Column(String(100))
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    daily_capacity = Column(Integer, default=100)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    operators = relationship("Operator", back_populates="centre")
    slots = relationship("Slot", back_populates="centre")
    bookings = relationship("Booking", back_populates="centre")
    queue_entries = relationship("QueueEntry", back_populates="centre")
    counters = relationship("CentreCounter", back_populates="centre")

class Operator(Base):
    __tablename__ = "operators"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    operator_id = Column(String(50), unique=True, index=True)
    centre_id = Column(Integer, ForeignKey("procurement_centres.id"))
    is_approved = Column(Boolean, default=False)

    user = relationship("User", back_populates="operator")
    centre = relationship("ProcurementCentre", back_populates="operators")

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    admin_id = Column(String(50), unique=True, index=True)

    user = relationship("User", back_populates="admin")

class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    rate = Column(Float, nullable=False) # Rate per quintal or unit
    active = Column(Boolean, default=True)

    bookings = relationship("Booking", back_populates="crop")

class Slot(Base):
    __tablename__ = "slots"

    id = Column(Integer, primary_key=True, index=True)
    centre_id = Column(Integer, ForeignKey("procurement_centres.id"))
    date = Column(DateTime(timezone=True), nullable=False) # Store date portion
    start_time = Column(String(10), nullable=False) # e.g. "10:00 AM"
    end_time = Column(String(10), nullable=False)
    capacity = Column(Integer, nullable=False)
    booked_count = Column(Integer, default=0)
    status = Column(String(20), default="ACTIVE")

    centre = relationship("ProcurementCentre", back_populates="slots")
    bookings = relationship("Booking", back_populates="slot")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"))
    centre_id = Column(Integer, ForeignKey("procurement_centres.id"))
    slot_id = Column(Integer, ForeignKey("slots.id"))
    crop_id = Column(Integer, ForeignKey("crops.id"))
    token_number = Column(String(20), unique=True, index=True)
    expected_quantity = Column(Float, nullable=False)
    qr_reference = Column(String(100), unique=True)
    status = Column(Enum(BookingStatus), default=BookingStatus.BOOKED)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    farmer = relationship("Farmer", back_populates="bookings")
    centre = relationship("ProcurementCentre", back_populates="bookings")
    slot = relationship("Slot", back_populates="bookings")
    crop = relationship("Crop", back_populates="bookings")
    queue_entry = relationship("QueueEntry", back_populates="booking", uselist=False)
    procurement = relationship("Procurement", back_populates="booking", uselist=False)

class QueueEntry(Base):
    __tablename__ = "queue_entries"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True)
    centre_id = Column(Integer, ForeignKey("procurement_centres.id"))
    queue_position = Column(Integer)
    status = Column(Enum(BookingStatus), default=BookingStatus.BOOKED)
    arrived_at = Column(DateTime(timezone=True), nullable=True)
    called_at = Column(DateTime(timezone=True), nullable=True)
    processing_started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    exception_reason = Column(Text, nullable=True)

    booking = relationship("Booking", back_populates="queue_entry")
    centre = relationship("ProcurementCentre", back_populates="queue_entries")

class Procurement(Base):
    __tablename__ = "procurement"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True)
    expected_quantity = Column(Float, nullable=False)
    actual_quantity = Column(Float, nullable=True)
    rate = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=True)
    quality_grade = Column(String(50), nullable=True)
    moisture_percentage = Column(Float, nullable=True)
    remarks = Column(Text, nullable=True)
    status = Column(Enum(ProcurementStatus), default=ProcurementStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    booking = relationship("Booking", back_populates="procurement")
    payment = relationship("Payment", back_populates="procurement", uselist=False)

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    procurement_id = Column(Integer, ForeignKey("procurement.id"), unique=True)
    amount = Column(Float, nullable=False)
    transaction_id = Column(String(100), nullable=True)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    procurement = relationship("Procurement", back_populates="payment")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50))
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")

class OTPRequest(Base):
    __tablename__ = "otp_requests"

    id = Column(Integer, primary_key=True, index=True)
    mobile = Column(String(15), index=True, nullable=True)
    email = Column(String(100), index=True, nullable=True)
    purpose = Column(String(50))
    otp_hash = Column(String(255))
    attempt_count = Column(Integer, default=0)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class CentreCounter(Base):
    __tablename__ = "centre_counters"

    id = Column(Integer, primary_key=True, index=True)
    centre_id = Column(Integer, ForeignKey("procurement_centres.id"))
    name = Column(String(50))
    active = Column(Boolean, default=True)
    current_booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    centre = relationship("ProcurementCentre", back_populates="counters")
    current_booking = relationship("Booking")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    role = Column(String(50))
    action = Column(String(100), nullable=False)
    entity = Column(String(100))
    entity_id = Column(String(100))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    metadata_json = Column(Text, nullable=True)

    user = relationship("User", back_populates="audit_logs")

class ProcurementCompany(Base):
    __tablename__ = "procurement_companies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    owner_name = Column(String(100), nullable=False)
    authorized_person_name = Column(String(100))
    company_name = Column(String(200), nullable=False)
    registration_number = Column(String(100))
    company_type = Column(String(100))
    gst_number = Column(String(50))
    pan_number = Column(String(50))
    address = Column(Text)
    village = Column(String(100))
    district = Column(String(100))
    state = Column(String(100))
    pincode = Column(String(20))
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    approval_status = Column(Enum(CompanyApprovalStatus), default=CompanyApprovalStatus.PENDING)
    active_status = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="procurement_company")
    crop_requirements = relationship("CompanyCropRequirement", back_populates="company")

class CompanyCropRequirement(Base):
    __tablename__ = "company_crop_requirements"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("procurement_companies.id"))
    crop_id = Column(Integer, ForeignKey("crops.id"))
    maximum_quantity = Column(Float, nullable=False)
    unit = Column(String(20), default="Quintals")
    procurement_rate = Column(Float, nullable=True)
    procured_quantity = Column(Float, default=0)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    company = relationship("ProcurementCompany", back_populates="crop_requirements")
    crop = relationship("Crop")
