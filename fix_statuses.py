from api import database, models
from sqlalchemy import func

def fix_patient_statuses():
    db = next(database.get_db())
    try:
        patients = db.query(models.Patient).all()
        print(f"Updating statuses for {len(patients)} patients...")
        
        for patient in patients:
            # Find the latest EEG record for this patient
            latest_record = db.query(models.EEGRecord)\
                              .filter(models.EEGRecord.patient_id == patient.id)\
                              .order_by(models.EEGRecord.timestamp.desc())\
                              .first()
            
            if latest_record:
                print(f"Patient {patient.name}: Latest risk {latest_record.risk_status}")
                patient.status = latest_record.risk_status
            else:
                # If no records, set to ACTIVE if is_active, else INACTIVE
                patient.status = "ACTIVE" if patient.is_active else "INACTIVE"
        
        db.commit()
        print("Success!")
    finally:
        db.close()

if __name__ == "__main__":
    fix_patient_statuses()
