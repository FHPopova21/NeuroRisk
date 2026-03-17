from sqlalchemy import Column, String, Boolean, Integer, Float, DateTime, ForeignKey, Text, Date
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class Admin(Base):
    """
    Модел за администратори на системата.
    """
    __tablename__ = "admins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Doctor(Base):
    """
    Модел за лекари. Включва админ-идентификатор и статус на верификация.
    """
    __tablename__ = "doctors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    admin_assigned_id = Column(String(50), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    specialization = Column(String(100))
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Връзки
    patients = relationship("Patient", back_populates="doctor")
    notes = relationship("MedicalNote", back_populates="doctor")

class Patient(Base):
    """
    Модел за пациенти. Включва токени за активация и статус на мониторинг.
    """
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctors.id", ondelete="SET NULL"))
    patient_id = Column(String(20), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(Text, nullable=True) # Задава се след активация
    birth_date = Column(Date)
    gender = Column(String(20))
    medical_history = Column(Text)
    activation_token = Column(String(100))
    token_expires_at = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=False)
    status = Column(String(20), default="INACTIVE") 
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Връзки
    doctor = relationship("Doctor", back_populates="patients")
    eeg_records = relationship("EEGRecord", back_populates="patient", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="patient", cascade="all, delete-orphan")
    notes = relationship("MedicalNote", back_populates="patient", cascade="all, delete-orphan")

class EEGRecord(Base):
    """
    Модел за ЕЕГ записи и резултати от AI анализа.
    """
    __tablename__ = "eeg_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    risk_score = Column(Integer) # 0-100
    risk_status = Column(String(20)) # LOW, MEDIUM, HIGH
    interpretation = Column(Text)
    amplitude = Column(Float)
    frequency = Column(Float)
    hjorth_activity = Column(Float)
    complexity = Column(Float)
    ai_metadata = Column(JSONB) # Гъвкаво съхранение на метаданни

    # Връзки
    patient = relationship("Patient", back_populates="eeg_records")

class Alert(Base):
    """
    Модел за системни и AI аларми.
    """
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    message = Column(Text, nullable=False)
    severity = Column(String(20))
    source = Column(String(50)) # 'AI', 'system'
    type = Column(String(50))   # 'seizure_risk', 'anomaly'
    is_read = Column(Boolean, default=False)

    # Връзки
    patient = relationship("Patient", back_populates="alerts")

class MedicalNote(Base):
    """
    Клинични бележки, добавени от лекаря за конкретен пациент.
    """
    __tablename__ = "medical_notes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctors.id", ondelete="SET NULL"))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    content = Column(Text, nullable=False)

    # Връзки
    patient = relationship("Patient", back_populates="notes")
    doctor = relationship("Doctor", back_populates="notes")
