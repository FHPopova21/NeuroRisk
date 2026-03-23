import bcrypt
from sqlalchemy.orm import Session
from api import models, schemas

def hash_password(password: str) -> str:
    """Превръща чиста парола в неразпознаваем хеш чрез bcrypt."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверява дали въведената парола съответства на хеша чрез bcrypt."""
    return bcrypt.checkpw(
        plain_password.encode('utf-8'), 
        hashed_password.encode('utf-8')
    )

def create_doctor(db: Session, doctor_data: schemas.DoctorCreate):
    """
    Основна функция за регистрация на нов лекар.
    """
    # 1. Проверка дали паролите съвпадат
    if doctor_data.password != doctor_data.confirm_password:
        raise Exception("Паролите не съвпадат!")

    # 2. Проверка дали имейлът вече съществува
    existing_doctor = db.query(models.Doctor).filter(models.Doctor.email == doctor_data.email).first()
    if existing_doctor:
        raise Exception("Този имейл вече е регистриран!")

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

def authenticate_user(db: Session, username_or_email: str, password: str):
    """
    Проверява паролата за администратор, лекар или пациент.
    Връща потребителя и неговата роля.
    """
    # 1. Първо за администратор (по потребителско име)
    admin = db.query(models.Admin).filter(models.Admin.username == username_or_email).first()
    if admin and verify_password(password, admin.password_hash):
        return admin, 'admin'

    # 2. После търсим за лекар (по имейл или служебен ID)
    doctor = db.query(models.Doctor).filter(
        (models.Doctor.email == username_or_email) | 
        (models.Doctor.admin_assigned_id == username_or_email)
    ).first()
    
    if doctor and verify_password(password, doctor.password_hash):
        return doctor, 'doctor'
    
    # 3. После за пациент (по имейл или пациентски ID)
    patient = db.query(models.Patient).filter(
        (models.Patient.email == username_or_email) | 
        (models.Patient.patient_id == username_or_email)
    ).first()
    
    if patient and verify_password(password, patient.password_hash):
        if not patient.is_active:
            raise Exception("Профилът още не е активиран!")
        return patient, 'patient'
        
    return None, None
