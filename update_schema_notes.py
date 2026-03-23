import sqlite3
import os
from dotenv import load_dotenv

load_dotenv('api/.env')
DB_URL = os.getenv('DATABASE_URL', 'postgresql://neuro_user:neuro_pass@localhost/neurorisk_db')

def update_schema():
    # If using SQLite (default for some dev), we use sqlite3. 
    # But the project seems to use PostgreSQL based on requirements.
    # However, let's check if it's connected to a local sqlite file.
    
    if "sqlite" in DB_URL:
        db_path = DB_URL.replace("sqlite:///", "")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        try:
            cursor.execute("ALTER TABLE eeg_records ADD COLUMN doctor_note TEXT")
            print("Added doctor_note to eeg_records (SQLite)")
        except sqlite3.OperationalError as e:
            print(f"Skipping eeg_records update: {e}")
        conn.commit()
        conn.close()
    else:
        # PostgreSQL
        import psycopg2
        # Parse URL
        # postgresql://user:pass@host/db
        try:
            conn = psycopg2.connect(DB_URL)
            cursor = conn.cursor()
            try:
                cursor.execute("ALTER TABLE eeg_records ADD COLUMN doctor_note TEXT")
                print("Added doctor_note to eeg_records (Postgres)")
            except Exception as e:
                print(f"Skipping eeg_records update: {e}")
            conn.commit()
            cursor.close()
            conn.close()
        except Exception as e:
            print(f"Failed to connect to Postgres: {e}")

if __name__ == "__main__":
    update_schema()
