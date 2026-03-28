from sqlalchemy.orm import Session
from api import models
import bcrypt
from typing import Optional, Tuple
from sqlalchemy.ext.declarative import DeclarativeMeta as Base

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password:
        return False
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_doctor(db: Session, doctor_data):
    # Check if email exists
    if db.query(models.Doctor).filter(models.Doctor.email == doctor_data.email).first():
        raise Exception("Имейлът вече е регистриран!")
    
    hashed_pwd = hash_password(doctor_data.password)
    db_doctor = models.Doctor(
        name=doctor_data.name,
        email=doctor_data.email,
        password_hash=hashed_pwd,
        admin_assigned_id=doctor_data.admin_assigned_id,
        specialization=doctor_data.specialization,
        is_active=True 
    )
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor

def authenticate_user(db: Session, email_or_id: str, password: str = None) -> Tuple[Optional[Base], Optional[str]]:
    """
    Автентикира потребител по имейл/ID и парола.
    Връща (потребител, роля) или (None, None).
    """
    print(f"--- AUTH DEBUG ---")
    print(f"Attempting login for: {email_or_id}")

    # 1. Търсим в Admin
    admin = db.query(models.Admin).filter(models.Admin.username == email_or_id).first()
    if admin:
        print("Checking Admin...")
        if verify_password(password, admin.password_hash):
            print("Login Success: Admin")
            return admin, 'admin'

    # 2. Търсим в Doctor
    doctor = db.query(models.Doctor).filter(models.Doctor.email == email_or_id).first()
    if doctor:
        print("Checking Doctor...")
        if verify_password(password, doctor.password_hash):
            print("Login Success: Doctor")
            return doctor, 'doctor'

    # 3. Търсим в Patient
    patient = db.query(models.Patient).filter(models.Patient.patient_id == email_or_id).first()
    if not patient:
        patient = db.query(models.Patient).filter(models.Patient.email == email_or_id).first()
    
    if patient:
        print(f"Checking Patient: {patient.patient_id}")
        # Ако няма заложена парола още или паролата съвпада с ID-то, или е празна
        # Това позволява първоначален вход
        if not patient.password_hash:
            print("Login Success: Patient (Initial No-Password)")
            return patient, 'patient'
        
        # Ако потребителят е подал парола (дори и да е същата като ID-то)
        if password and verify_password(password, patient.password_hash):
            print("Login Success: Patient (Password)")
            return patient, 'patient'
            
        # Fallback за стария метод с ID като парола (ако е записана така)
        if password == patient.patient_id:
             print("Login Success: Patient (ID fallback)")
             return patient, 'patient'

    print("Login Failed: No match found")
    return None, None
