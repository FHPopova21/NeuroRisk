import os
import numpy as np
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from api import models, database, schemas
from api.services.monitoring import calculate_signal_features

# Зареждане на настройките
load_dotenv('api/.env')

def fix_all_records():
    db = next(database.get_db())
    try:
        records = db.query(models.EEGRecord).all()
        print(f"Found {len(records)} records to check.")
        
        updated_count = 0
        for record in records:
            # Проверяваме дали характеристиките са попълнени
            if record.hjorth_activity is None or record.rms is None:
                raw_signal = record.ai_metadata.get("raw_signal") if record.ai_metadata else None
                if raw_signal:
                    features = calculate_signal_features(raw_signal)
                    
                    record.hjorth_activity = features["hjorth_activity"]
                    record.hjorth_mobility = features["hjorth_mobility"]
                    record.hjorth_complexity = features["hjorth_complexity"]
                    record.rms = features["rms"]
                    record.zcr = features["zcr"]
                    record.envelope_max = features["envelope_max"]
                    record.deriv1_std = features["deriv1_std"]
                    record.deriv2_std = features["deriv2_std"]
                    record.amplitude = float(np.mean(np.abs(raw_signal)))
                    
                    updated_count += 1
        
        db.commit()
        print(f"Successfully updated {updated_count} records with features.")
    finally:
        db.close()

if __name__ == "__main__":
    fix_all_records()
