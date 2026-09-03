from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    is_registered: Optional[bool] = None

class FarmerToken(Token):
    user: Optional["FarmerResponse"] = None
    
class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None

class FarmerLogin(BaseModel):
    mobile: str = Field(min_length=10, max_length=15)
    
class OTPVerify(BaseModel):
    mobile: str = Field(min_length=10, max_length=15)
    otp: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")
    
class OperatorLogin(BaseModel):
    operator_id: str
    password: str

class AdminLogin(BaseModel):
    email: str
    password: str

class FarmerCreate(BaseModel):
    name: str
    mobile: str
    farmer_id: Optional[str] = None
    email: Optional[str] = None
    village: str
    mandal: str
    district: str
    state: str
    pincode: str
    land_area: Optional[float] = None
    primary_crops: Optional[str] = None
    other_crops: Optional[str] = None
    preferred_centre_id: Optional[int] = None

class FarmerUpdate(BaseModel):
    name: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None
    village: Optional[str] = None
    mandal: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    land_area: Optional[float] = None
    primary_crops: Optional[str] = None
    other_crops: Optional[str] = None
    preferred_centre_id: Optional[int] = None

class FarmerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    farmer_id: str
    mobile: Optional[str] = None
    email: Optional[str] = None
    village: str
    mandal: Optional[str] = None
    district: str
    state: str
    pincode: Optional[str] = None
    land_area: Optional[float] = None
    primary_crops: Optional[str] = None
    other_crops: Optional[str] = None
    preferred_centre_id: Optional[int] = None

class CropResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    rate: float
    active: bool

class ProcurementCentreResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    address: str
    village: str
    district: str
    state: str
    latitude: Optional[float]
    longitude: Optional[float]
    daily_capacity: int
    active: bool

class SlotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    centre_id: int
    date: datetime
    start_time: str
    end_time: str
    capacity: int
    booked_count: int
    status: str

class BookingCreate(BaseModel):
    centre_id: int
    slot_id: int
    crop_id: int
    expected_quantity: float

class BookingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    token_number: str
    expected_quantity: float
    status: str
    qr_reference: str
    created_at: datetime
    farmer: FarmerResponse
    centre: ProcurementCentreResponse
    slot: SlotResponse
    crop: CropResponse

class QueueEntryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_id: int
    queue_position: Optional[int] = None
    status: str
    arrived_at: Optional[datetime]
    called_at: Optional[datetime]
    processing_started_at: Optional[datetime]
    completed_at: Optional[datetime]

class QueueEntryWithBookingResponse(BaseModel):
    """Extended queue entry that includes nested booking details for the operator dashboard."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_id: int
    queue_position: Optional[int] = None
    status: str
    arrived_at: Optional[datetime]
    called_at: Optional[datetime]
    processing_started_at: Optional[datetime]
    completed_at: Optional[datetime]
    booking: Optional[BookingResponse] = None

class QueueStatusResponse(BaseModel):
    queue_position: int
    people_ahead: int
    estimated_wait_minutes: int
    status: str
    current_token: Optional[str] = None

class ProcurementCreate(BaseModel):
    actual_quantity: float

class ProcurementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_id: int
    expected_quantity: float
    actual_quantity: Optional[float]
    rate: float
    total_amount: Optional[float]
    status: str

class PaymentUpdate(BaseModel):
    status: str
    transaction_id: Optional[str]

class PaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    amount: float
    transaction_id: Optional[str]
    status: str
    paid_at: Optional[datetime]
