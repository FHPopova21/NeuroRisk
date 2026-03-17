from passlib.context import CryptContext
from sqlalchemy.orm import Session
from api import models, schemas
from fastapi import HTTPException, status

# 1. Контекст за хеширане на пароли (bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Превръща чиста парола в неразпознаваем хеш."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверява дали въведената парола съответства на хеша."""
    return pwd_context.verify(plain_password, hashed_password)

def create_doctor(db: Session, doctor_data: schemas.DoctorCreate):
    """
    Основна функция за регистрация на нов лекар.
    """
    # 1. Проверка дали паролите съвпадат
    if doctor_data.password != doctor_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Паролите не съвпадат!"
        )

    # 2. Проверка дали имейлът вече съществува
    existing_doctor = db.query(models.Doctor).filter(models.Doctor.email == doctor_data.email).first()
    if existing_doctor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Този имейл вече е регистриран!"
        )

    # 3. Хеширане на паролата 
    hashed_pwd = hash_password(doctor_data.password)

    # 4. Създаване на обекта за базата данни
    new_doctor = models.Doctor(
        admin_assigned_id=doctor_data.admin_assigned_id,
        name=doctor_data.name,
        email=doctor_data.email,
        password_hash=hashed_pwd,
        specialization=doctor_data.specialization
    )

    # 5. Записване в базата
    db.add(new_doctor)
    db.commit()
    db.refresh(new_doctor) # Вземане на генерираното ID и други полета
    
    return new_doctor
