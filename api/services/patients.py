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

    # 2. Генериране на токен
    token = secrets.token_urlsafe(32) # Сигурен случаен токен
    expiry = datetime.now() + timedelta(days=7) # Токенът важи 7 дни

    # 3. Създаване на пациента в базата
    new_patient = models.Patient(
        doctor_id=doctor_id,
        patient_id=patient_data.patient_id,
        name=patient_data.name,
        email=patient_data.email,
        birth_date=patient_data.birth_date,
        gender=patient_data.gender,
        medical_history=patient_data.medical_history,
        password_hash=hash_password(patient_data.patient_id), # Временна парола = Patient ID
        activation_token=token,
        token_expires_at=expiry,
        is_active=False,
        status="ACTIVE" if patient_data.has_epilepsy else "INACTIVE"
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    
    # NEW: Create initial medical note from history if it exists
    if patient_data.medical_history:
        initial_note = models.MedicalNote(
            patient_id=new_patient.id,
            doctor_id=doctor_id,
            content=f"[Първоначална Анамнеза]: {patient_data.medical_history}"
        )
        db.add(initial_note)
        db.commit()
    
    # 4. Ако има начални ЕЕГ данни, обработваме ги
    if patient_data.initial_eeg_data:
        from api.services.monitoring import process_eeg_signal
        from api import schemas as monitoring_schemas
        
        signal_in = monitoring_schemas.EEGSignalIn(
            patient_id=new_patient.id,
            signal=patient_data.initial_eeg_data
        )
        process_eeg_signal(db, signal_in)

    # 5. Пращане на имейл (Real SMTP + Mock Log)
    login_url = f"http://localhost:5173/login"
    from api.utils.email_service import send_activation_email
    
    send_activation_email(
        to_email=new_patient.email,
        patient_id=new_patient.patient_id,
        activation_url=login_url
    )

    print(f"--- EMAIL SERVICE LOG ---")
    print(f"To: {new_patient.email}")
    print(f"Subject: NeuroRisk - Активация на профил")
    print(f"Message: Здравейте, Вашият Patient ID е: {new_patient.patient_id}")
    print(f"Временна парола: {new_patient.patient_id}")
    print(f"Влезте тук: {login_url}")
    print(f"--------------------------")

    return new_patient, token

def create_lab_analysis(db: Session, patient_id: str, doctor_id: str, file_url: str, file_name: str, file_type: str, notes: str = None):
    """
    Създава запис за качен лабораторен анализ.
    """
    new_analysis = models.LabAnalysis(
        patient_id=patient_id,
        doctor_id=doctor_id,
        file_url=file_url,
        file_name=file_name,
        file_type=file_type,
        notes=notes
    )
    db.add(new_analysis)
    db.commit()
    db.refresh(new_analysis)
    return new_analysis

def get_lab_analyses_by_patient(db: Session, patient_id: str):
    """
    Връща всички лабораторни анализи за даден пациент, сортирани по най-нови.
    """
    return db.query(models.LabAnalysis)\
             .filter(models.LabAnalysis.patient_id == patient_id)\
             .order_by(models.LabAnalysis.timestamp.desc())\
             .all()

def create_medical_note(db: Session, patient_id: str, doctor_id: str, content: str):
    """
    Добавя нова медицинска бележка към профила на пациент.
    """
    new_note = models.MedicalNote(
        patient_id=patient_id,
        doctor_id=doctor_id,
        content=content
    )
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    return new_note

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

def get_patient_by_id(db: Session, patient_id: str):
    """
    Връща пациент по неговия UUID.
    """
    return db.query(models.Patient).filter(models.Patient.id == patient_id).first()

def get_patients_by_doctor(db: Session, doctor_id: str):
    """
    Връща всички пациенти, за които отговаря даден лекар.
    """
    return db.query(models.Patient).filter(models.Patient.doctor_id == doctor_id).all()
