from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from api import schemas, database
from api.services import auth

# 1. Създаваме Рутер (Router) специално за автентикация
router = APIRouter(
    prefix="/auth",
    tags=["Authentication (Автентикация)"]
)

@router.post("/register/doctor", response_model=schemas.Doctor)
def register_doctor(doctor: schemas.DoctorCreate, db: Session = Depends(database.get_db)):
    """
    Ендпойнът за регистрация на нов лекар.
    Приема Pydantic схема и връща създадения лекар (без паролата).
    """
    # Извикваме логиката от нашия сервиз
    return auth.create_doctor(db=db, doctor_data=doctor)
