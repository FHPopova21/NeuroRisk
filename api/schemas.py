from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime, date
from uuid import UUID

# --- ОСНОВНИ СХЕМИ ---

class DoctorBase(BaseModel):
    admin_assigned_id: str
    name: str
    email: EmailStr
    specialization: Optional[str] = None

class DoctorCreate(DoctorBase):
    password: str
    confirm_password: str

class Doctor(DoctorBase):
    id: UUID
    is_verified: bool
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class DoctorUpdate(BaseModel):
    is_verified: Optional[bool] = None
    status: Optional[str] = None

# --- ПАЦИЕНТИ ---

class PatientBase(BaseModel):
    patient_id: str
    name: str
    email: EmailStr
    birth_date: Optional[date] = None
    gender: Optional[str] = None
    medical_history: Optional[str] = None
    status: str = "INACTIVE"

class PatientCreate(PatientBase):
    """Използва се от лекаря при първоначално създаване."""
    pass

class PatientActivate(BaseModel):
    """Използва се от пациента при активиране на акаунта."""
    password: str
    confirm_password: str

class Patient(PatientBase):
    id: UUID
    doctor_id: Optional[UUID]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- ЕЕГ ЗАПИСИ ---

class EEGRecordBase(BaseModel):
    risk_score: int = Field(..., ge=0, le=100)
    risk_status: str # LOW, MEDIUM, HIGH
    interpretation: Optional[str] = None
    amplitude: Optional[float] = None
    frequency: Optional[float] = None
    hjorth_activity: Optional[float] = None
    hjorth_mobility: Optional[float] = None
    hjorth_complexity: Optional[float] = None
    rms: Optional[float] = None
    zcr: Optional[float] = None
    envelope_max: Optional[float] = None
    deriv1_std: Optional[float] = None
    deriv2_std: Optional[float] = None
    ai_metadata: Optional[dict] = None

class EEGRecordCreate(EEGRecordBase):
    patient_id: UUID

class EEGSignalIn(BaseModel):
    """Схема за входящ суров ЕЕГ сигнал."""
    patient_id: UUID
    signal: List[float]
    sampling_rate: float = 256.0

class EEGRecord(EEGRecordBase):
    id: UUID
    timestamp: datetime

    class Config:
        from_attributes = True

# --- АЛАРМИ ---

class AlertBase(BaseModel):
    message: str
    severity: str
    source: str
    type: str

class AlertCreate(AlertBase):
    patient_id: UUID

class Alert(AlertBase):
    id: UUID
    timestamp: datetime
    is_read: bool
    patient: Optional[Patient] = None
    doctor: Optional[Doctor] = None

    class Config:
        from_attributes = True

class ActivityLog(BaseModel):
    id: UUID
    user_id: UUID
    user_role: str
    action: str
    details: Optional[str] = None
    timestamp: datetime
    class Config:
        from_attributes = True

class AdminStats(BaseModel):
    total_doctors: int
    total_patients: int
    active_sessions: int
    high_risk_alerts: int
    analyses_over_time: list[dict]
    recent_activity: list[ActivityLog]

# --- МЕДИЦИНСКИ БЕЛЕЖКИ ---

class MedicalNoteBase(BaseModel):
    content: str

class MedicalNoteCreate(MedicalNoteBase):
    patient_id: UUID

class MedicalNote(MedicalNoteBase):
    id: UUID
    doctor_id: Optional[UUID]
    timestamp: datetime

    class Config:
        from_attributes = True
