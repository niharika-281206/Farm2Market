from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.all_models import ProcurementCompany, CompanyCropRequirement, User, UserRole, Crop, CompanyApprovalStatus
from app.schemas.all_schemas import Token, CropResponse
from app.core.security import create_access_token, get_password_hash, verify_password
from pydantic import BaseModel, ConfigDict
from typing import Optional

router = APIRouter(prefix="/api/v1/company", tags=["company"])
auth_router = APIRouter(prefix="/api/v1/auth/company", tags=["company_auth"])

class CompanyRegister(BaseModel):
    owner_name: str
    company_name: str
    mobile: str
    email: str
    password: str
    registration_number: Optional[str] = None
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    address: str
    village: Optional[str] = None
    district: str
    state: str
    pincode: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class CompanyLogin(BaseModel):
    email: str
    password: str

class CompanyCropRequirementCreate(BaseModel):
    crop_id: int
    maximum_quantity: float
    unit: str = "Quintals"
    procurement_rate: Optional[float] = None

class CompanyCropRequirementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    crop_id: int
    maximum_quantity: float
    unit: str
    procurement_rate: Optional[float]
    procured_quantity: float
    active: bool
    crop: "CropResponse" = None # Assuming CropResponse is imported or defined elsewhere

class ProcurementCompanyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    owner_name: str
    company_name: str
    approval_status: str
    active_status: bool
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    district: Optional[str] = None
    crop_requirements: List[CompanyCropRequirementResponse] = []

@auth_router.post("/register")
def register_company(data: CompanyRegister, db: Session = Depends(get_db)):
    # Check if mobile or email exists
    existing = db.query(User).filter((User.mobile == data.mobile) | (User.email == data.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Mobile or email already registered")

    user = User(
        role=UserRole.PROCUREMENT_COMPANY,
        mobile=data.mobile,
        email=data.email,
        password_hash=get_password_hash(data.password)
    )
    db.add(user)
    db.flush()

    company = ProcurementCompany(
        user_id=user.id,
        owner_name=data.owner_name,
        company_name=data.company_name,
        registration_number=data.registration_number,
        gst_number=data.gst_number,
        pan_number=data.pan_number,
        address=data.address,
        village=data.village,
        district=data.district,
        state=data.state,
        pincode=data.pincode,
        latitude=data.latitude,
        longitude=data.longitude,
        approval_status=CompanyApprovalStatus.PENDING
    )
    db.add(company)
    db.commit()

    return {"message": "Company registered successfully. Waiting for admin approval."}

@auth_router.post("/login", response_model=Token)
def login_company(data: CompanyLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email, User.role == UserRole.PROCUREMENT_COMPANY).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.email_verified:
        raise HTTPException(status_code=403, detail="unverified_email")

    company = user.procurement_company
    if company.approval_status != CompanyApprovalStatus.APPROVED:
        raise HTTPException(status_code=403, detail=f"Company account is {company.approval_status.value}")
    if not company.active_status:
        raise HTTPException(status_code=403, detail="Company account is disabled")

    access_token = create_access_token(subject=user.id, role=user.role.value)
    return {"access_token": access_token, "token_type": "bearer", "role": user.role.value}

from app.models.all_models import OTPRequest
from app.services.sms_service import generate_otp
from app.services.email_service import send_verification_email, generate_email_otp
from datetime import datetime, timedelta

class SendEmailVerification(BaseModel):
    email: str

class VerifyEmail(BaseModel):
    email: str
    code: str

@auth_router.post("/send-verification")
def send_company_verification(data: SendEmailVerification, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email, User.role == UserRole.PROCUREMENT_COMPANY).first()
    if not user:
        raise HTTPException(status_code=404, detail="Company not found")
    if user.email_verified:
        raise HTTPException(status_code=400, detail="Email is already verified")

    latest = db.query(OTPRequest).filter(
        OTPRequest.email == data.email,
        OTPRequest.purpose == "EMAIL_VERIFY"
    ).order_by(OTPRequest.created_at.desc()).first()
    
    if latest and latest.created_at and (datetime.utcnow() - latest.created_at).total_seconds() < 30:
        raise HTTPException(status_code=429, detail="Please wait 30 seconds before requesting another code.")

    code = generate_email_otp()
    if not send_verification_email(data.email, code):
        raise HTTPException(status_code=502, detail="Failed to send verification email.")

    expires = datetime.utcnow() + timedelta(minutes=5)
    otp_req = OTPRequest(email=data.email, purpose="EMAIL_VERIFY", otp_hash=get_password_hash(code), expires_at=expires)
    db.add(otp_req)
    db.commit()
    return {"success": True, "message": "Verification code sent."}

@auth_router.post("/verify-email")
def verify_company_email(data: VerifyEmail, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email, User.role == UserRole.PROCUREMENT_COMPANY).first()
    if not user:
        raise HTTPException(status_code=404, detail="Company not found")

    otp_req = db.query(OTPRequest).filter(
        OTPRequest.email == data.email,
        OTPRequest.purpose == "EMAIL_VERIFY",
        OTPRequest.verified_at == None
    ).order_by(OTPRequest.created_at.desc()).first()

    if not otp_req or otp_req.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Verification code expired. Please request a new one.")
    if otp_req.attempt_count >= 5:
        raise HTTPException(status_code=429, detail="Too many attempts. Please request a new code.")
    if not verify_password(data.code, otp_req.otp_hash):
        otp_req.attempt_count += 1
        db.commit()
        raise HTTPException(status_code=400, detail="Incorrect verification code.")

    otp_req.verified_at = datetime.utcnow()
    user.email_verified = True
    user.email_verified_at = datetime.utcnow()
    db.commit()
    return {"success": True, "message": "Email verified successfully."}

    access_token = create_access_token(subject=user.id, role=user.role.value)
    return {"access_token": access_token, "token_type": "bearer", "role": user.role.value}

from app.middleware.auth import get_current_user

def get_current_company(user: User = Depends(get_current_user)):
    if user.role != UserRole.PROCUREMENT_COMPANY:
        raise HTTPException(status_code=403, detail="Not authorized as company")
    return user

@router.get("/profile", response_model=ProcurementCompanyResponse)
def get_company_profile(user: User = Depends(get_current_company)):
    return user.procurement_company

@router.get("/crops", response_model=List[CompanyCropRequirementResponse])
def get_company_crops(db: Session = Depends(get_db), user: User = Depends(get_current_company)):
    return user.procurement_company.crop_requirements

@router.post("/crops", response_model=CompanyCropRequirementResponse)
def add_company_crop(data: CompanyCropRequirementCreate, db: Session = Depends(get_db), user: User = Depends(get_current_company)):
    crop = db.query(Crop).filter(Crop.id == data.crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
        
    req = CompanyCropRequirement(
        company_id=user.procurement_company.id,
        crop_id=data.crop_id,
        maximum_quantity=data.maximum_quantity,
        unit=data.unit,
        procurement_rate=data.procurement_rate
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req
