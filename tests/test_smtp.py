import os
import sys

# Load dotenv to get new credentials
from dotenv import load_dotenv
load_dotenv(dotenv_path='c:/Users/student/source/repos/2526-dzi-ai-FHPopova21/api/.env')

sys.path.append('c:/Users/student/source/repos/2526-dzi-ai-FHPopova21')

from api.utils.email_service import send_activation_email

if __name__ == "__main__":
    print(f"Testing SMTP with config user={os.getenv('SMTP_USER')}")
    success = send_activation_email(
        to_email=os.getenv("FROM_EMAIL"), 
        patient_id="TEST_SMTP_001",
        activation_url="http://localhost:5173/login?activate=true"
    )
    if success:
        print("TEST SUCCESS: Database and Email setup complete!")
    else:
        print("TEST FAILED: Check SMTP credentials or network settings.")
