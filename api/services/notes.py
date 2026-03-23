from sqlalchemy.orm import Session, joinedload
from api import models, schemas
from uuid import UUID

def create_medical_note(db: Session, note_data: schemas.MedicalNoteCreate, doctor_id: UUID):
    """
    Създава нова клинична бележка за пациент.
    """
    new_note = models.MedicalNote(
        patient_id=note_data.patient_id,
        doctor_id=doctor_id,
        content=note_data.content
    )
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    return new_note

def get_patient_notes(db: Session, patient_id: str):
    """
    Връща всички бележки за конкретен пациент.
    """
    return db.query(models.MedicalNote)\
             .options(joinedload(models.MedicalNote.patient))\
             .filter(models.MedicalNote.patient_id == UUID(patient_id))\
             .order_by(models.MedicalNote.timestamp.desc())\
             .all()

def get_doctor_notes(db: Session, doctor_id: UUID):
    """
    Връща всички бележки, написани от конкретен лекар.
    """
    return db.query(models.MedicalNote)\
             .options(joinedload(models.MedicalNote.patient))\
             .filter(models.MedicalNote.doctor_id == doctor_id)\
             .order_by(models.MedicalNote.timestamp.desc())\
             .all()

def update_eeg_record_note(db: Session, record_id: str, note: str):
    """
    Обновява персоналната бележка към конкретен ЕЕГ запис.
    """
    record = db.query(models.EEGRecord).filter(models.EEGRecord.id == UUID(record_id)).first()
    if record:
        record.doctor_note = note
        db.commit()
        db.refresh(record)
    return record
