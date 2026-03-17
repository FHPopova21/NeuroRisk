from sqlalchemy.orm import Session
from api import models, schemas
from datetime import datetime

def create_note(db: Session, note_data: schemas.MedicalNoteCreate, doctor_id: str):
    """
    Създава нова медицинска бележка от лекар за конкретен пациент.
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
    Връща всички бележки за даден пациент, подредени по време.
    """
    return db.query(models.MedicalNote)\
             .filter(models.MedicalNote.patient_id == patient_id)\
             .order_by(models.MedicalNote.timestamp.desc())\
             .all()

def delete_note(db: Session, note_id: str, doctor_id: str):
    """
    Изтрива бележка (само ако лекарят е авторът).
    """
    note = db.query(models.MedicalNote).filter(
        models.MedicalNote.id == note_id,
        models.MedicalNote.doctor_id == doctor_id
    ).first()
    
    if not note:
        raise Exception("Бележката не е намерена или нямате права за изтриване!")
    
    db.delete(note)
    db.commit()
    return True
