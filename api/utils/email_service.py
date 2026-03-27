import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USER)

def send_activation_email(to_email: str, patient_id: str, activation_url: str):
    """
    Изпраща професионален имейл за активация на пациентски профил.
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        print("⚠️ SMTP credentials not configured. Falling back to console log.")
        print(f"--- EMAIL MOCK (Fallback) ---")
        print(f"To: {to_email}")
        print(f"Patient ID: {patient_id}")
        print(f"Link: {activation_url}")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "NeuroRisk - Активация на Вашия пациентски профил"
        msg["From"] = f"NeuroRisk Platform <{FROM_EMAIL}>"
        msg["To"] = to_email

        # HTML Template
        html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f4f7f6; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="background-color: #030213; padding: 30px; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">NeuroRisk</h1>
              </div>
              <div style="padding: 40px; color: #333333; line-height: 1.6;">
                <h2 style="color: #030213;">Здравейте,</h2>
                <p>Вашият лекуващ лекар създаде профил за Вас в платформата NeuroRisk.</p>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e9ecef;">
                  <p style="margin: 0; font-weight: bold; color: #555;">Вашият Patient ID:</p>
                  <p style="margin: 5px 0 0 0; font-size: 20px; color: #007bff; font-weight: bold;">{patient_id}</p>
                </div>
                <p>За да започнете да използвате мобилното приложение, трябва да активирате профила си и да зададете парола:</p>
                <div style="text-align: center; margin: 35px 0;">
                  <a href="{activation_url}" style="background-color: #007bff; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Активирай профила си</a>
                </div>
                <p style="font-size: 13px; color: #777;">Този линк е валиден за следващите 7 дни. Ако линкът не работи, копирайте този адрес в браузъра си:<br>{activation_url}</p>
              </div>
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eeeeee;">
                © 2026 NeuroRisk Platform. Всички права запазени.
              </div>
            </div>
          </body>
        </html>
        """
        
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        print(f"✅ Имейл за активация е изпратен успешно до {to_email}")
        return True
    except Exception as e:
        print(f"❌ Грешка при изпращане на имейл: {e}")
        return False
