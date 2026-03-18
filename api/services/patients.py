from sqlalchemy.orm import Session
from api import models, schemas
from api.services.auth import hash_password
import secrets
from datetime import datetime, timedelta

def generate_patient_id(db: Session) -> str:
    """
    Генерира уникално Patient ID във формат PN-XXXXX.
    """
    import random
    import string
    
    while True:
        # Генерираме случаен код от 5 цифри
        suffix = ''.join(random.choices(string.digits, k=5))
        patient_id = f"PN-{suffix}"
        
        # Проверяваме дали вече съществува в базата
        exists = db.query(models.Patient).filter(models.Patient.patient_id == patient_id).first()
        if not exists:
            return patient_id

def create_patient(db: Session, patient_data: schemas.PatientCreate, doctor_id: str):
    """
    Лекарят създава профил на пациент.
    Генерират се Patient ID и активационен токен.
    """
    # 1. Проверка дали имейлът вече съществува
    existing_patient = db.query(models.Patient).filter(models.Patient.email == patient_data.email).first()
    if existing_patient:
        raise Exception("Вече съществува пациент с този имейл!")

    # 2. Генериране на задължителните полета
    new_patient_id = generate_patient_id(db)
    token = secrets.token_urlsafe(32) # Сигурен случаен токен
    expiry = datetime.now() + timedelta(days=7) # Токенът важи 7 дни

    # 3. Създаване на пациента в базата
    new_patient = models.Patient(
        doctor_id=doctor_id,
        patient_id=new_patient_id,
        name=patient_data.name,
        email=patient_data.email,
        birth_date=patient_data.birth_date,
        gender=patient_data.gender,
        medical_history=patient_data.medical_history,
        activation_token=token,
        token_expires_at=expiry,
        is_active=False,
        status="INACTIVE"
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    
    # В реална ситуация тук ще изпратим имейл с токена. 
    # Засега просто го връщаме в отговора, за да го виждаме.
    return new_patient, token

def activate_patient(db: Session, token: str, activation_data: schemas.PatientActivate):
    """
    Пациентът активира акаунта си чрез токен и си поставя парола.
    """
    # 1. Намиране на пациента по токена
    patient = db.query(models.Patient).filter(
        models.Patient.activation_token == token,
        models.Patient.is_active == False
    ).first()

    if not patient:
        raise Exception("Невалиден или вече използван активационен токен!")

    # 2. Проверка на валидността на токена
    if datetime.now() > patient.token_expires_at:
        raise Exception("Активационният токен е изтекъл!")

    # 3. Валидация на паролата
    if activation_data.password != activation_data.confirm_password:
        raise Exception("Паролите не съвпадат!")

    # 4. Активиране
    patient.password_hash = hash_password(activation_data.password)
    patient.is_active = True
    patient.status = "ACTIVE"
    patient.activation_token = None # Изтриваме токена след употреба
    
    db.commit()
    db.refresh(patient)
    
    return patient
