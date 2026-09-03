from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.all_models import ProcurementCentre, Slot, Crop
from app.schemas.all_schemas import ProcurementCentreResponse, SlotResponse, CropResponse

router = APIRouter(prefix="/api/v1", tags=["centres"])

@router.get("/centres", response_model=List[ProcurementCentreResponse])
def get_centres(db: Session = Depends(get_db)):
    centres = db.query(ProcurementCentre).filter(ProcurementCentre.active == True).all()
    return centres

@router.get("/centres/{centre_id}", response_model=ProcurementCentreResponse)
def get_centre(centre_id: int, db: Session = Depends(get_db)):
    centre = db.query(ProcurementCentre).filter(ProcurementCentre.id == centre_id).first()
    if not centre:
        raise HTTPException(status_code=404, detail="Centre not found")
    return centre

@router.get("/centres/{centre_id}/slots", response_model=List[SlotResponse])
def get_centre_slots(centre_id: int, db: Session = Depends(get_db)):
    # Returning slots for the centre. Ideally filter by upcoming dates.
    slots = db.query(Slot).filter(Slot.centre_id == centre_id, Slot.status == "ACTIVE").all()
    return slots

@router.get("/crops", response_model=List[CropResponse])
def get_crops(db: Session = Depends(get_db)):
    crops = db.query(Crop).filter(Crop.active == True).all()
    return crops
