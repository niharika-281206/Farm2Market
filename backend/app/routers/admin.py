from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database.session import get_db
from app.models.all_models import ProcurementCentre, Crop, Slot, Operator, User, UserRole, Admin, ProcurementCompany, AuditLog, CompanyApprovalStatus
from app.schemas.all_schemas import ProcurementCentreResponse, CropResponse, SlotResponse
from app.middleware.auth import get_current_admin
from pydantic import BaseModel, ConfigDict

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])

# --- Pydantic Schemas for creation ---
class CentreCreate(BaseModel):
    name: str
    address: str
    village: str
    district: str
    state: str
    daily_capacity: int
    active: bool = True

class CropCreate(BaseModel):
    name: str
    rate: float
    active: bool = True

class SlotCreate(BaseModel):
    centre_id: int
    date: datetime
    start_time: str
    end_time: str
    capacity: int

class OperatorCreate(BaseModel):
    operator_id: str
    password: str
    email: str
    centre_id: int

# --- API Endpoints ---

@router.post("/centres", response_model=ProcurementCentreResponse)
def create_centre(data: CentreCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    centre = ProcurementCentre(**data.model_dump())
    db.add(centre)
    db.commit()
    db.refresh(centre)
    return centre

@router.post("/crops", response_model=CropResponse)
def create_crop(data: CropCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    crop = Crop(**data.model_dump())
    db.add(crop)
    db.commit()
    db.refresh(crop)
    return crop

@router.post("/slots", response_model=SlotResponse)
def create_slot(data: SlotCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    slot = Slot(**data.model_dump())
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot

from app.core.security import get_password_hash

@router.post("/operators")
def create_operator(data: OperatorCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        role=UserRole.OPERATOR, 
        email=data.email,
        password_hash=get_password_hash(data.password)
    )
    db.add(user)
    db.flush()
    
    operator = Operator(
        user_id=user.id,
        operator_id=data.operator_id,
        centre_id=data.centre_id
    )
    db.add(operator)
    
    # Send verification email immediately on creation
    from app.services.sms_service import generate_otp
    from app.services.email_service import send_verification_email
    from app.models.all_models import OTPRequest
    from datetime import timedelta
    
    code = generate_otp()
    if send_verification_email(data.email, code):
        expires = datetime.utcnow() + timedelta(minutes=5)
        otp_req = OTPRequest(email=data.email, purpose="EMAIL_VERIFY", otp_hash=get_password_hash(code), expires_at=expires)
        db.add(otp_req)
        
    db.commit()
    return {"status": "success", "operator_id": operator.operator_id}

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    from app.models.all_models import Farmer, Booking, Procurement, Payment
    from sqlalchemy import func
    
    total_farmers = db.query(Farmer).count()
    total_operators = db.query(Operator).count()
    total_centres = db.query(ProcurementCentre).count()
    today_bookings = db.query(Booking).count() # simplify for now
    total_companies = db.query(ProcurementCompany).count()
    
    return {
        "total_farmers": total_farmers,
        "total_operators": total_operators,
        "total_centres": total_centres,
        "total_companies": total_companies,
        "today_bookings": today_bookings
    }

class CompanyStatusUpdate(BaseModel):
    status: str

@router.get("/companies")
def get_companies(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    companies = db.query(ProcurementCompany).all()
    # Serialize manually or create a schema in all_schemas.py
    # Since we need a quick return, we can return the raw objects and FastAPI will serialize them.
    return companies

@router.patch("/companies/{company_id}/status")
def update_company_status(company_id: int, data: CompanyStatusUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    company = db.query(ProcurementCompany).filter(ProcurementCompany.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    try:
        new_status = CompanyApprovalStatus(data.status)
        company.approval_status = new_status
        db.commit()
        return {"message": f"Company status updated to {new_status.value}"}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")

@router.get("/audit-logs")
def get_audit_logs(limit: int = 100, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return logs

@router.get("/reports")
def get_reports(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    from app.models.all_models import Booking, Procurement, Payment
    from sqlalchemy import func
    
    total_procured = db.query(func.sum(Procurement.actual_quantity)).scalar() or 0
    total_paid = db.query(func.sum(Payment.amount)).filter(Payment.status == "COMPLETED").scalar() or 0
    
    return {
        "total_procured_quintals": total_procured,
        "total_payments_credited": total_paid,
    }

@router.get("/farmers")
def get_farmers(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    from app.models.all_models import Farmer
    farmers = db.query(Farmer).order_by(Farmer.created_at.desc()).all()
    # Serialize for frontend
    return farmers

class OperatorApprovalUpdate(BaseModel):
    is_approved: bool

@router.get("/operators")
def get_operators(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    operators = db.query(Operator).join(User).order_by(Operator.id.desc()).all()
    
    result = []
    for op in operators:
        # Safely fetch farmer name if exists, else default to 'Operator'
        name = "Operator"
        if op.user and op.user.farmer:
            name = op.user.farmer.name
            
        result.append({
            "id": op.id,
            "operator_id": op.operator_id,
            "name": name,
            "email": op.user.email,
            "centre_id": op.centre_id,
            "is_approved": op.is_approved,
            "email_verified": op.user.email_verified
        })
    return result

@router.patch("/operators/{operator_id}/approve")
def approve_operator(operator_id: int, data: OperatorApprovalUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    op = db.query(Operator).filter(Operator.id == operator_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Operator not found")
        
    op.is_approved = data.is_approved
    db.commit()
    
    if data.is_approved and op.user.email:
        from app.services.email_service import send_operator_approval_email
        send_operator_approval_email(op.user.email)
        
    return {"message": "Operator approved successfully" if data.is_approved else "Operator approval revoked"}

