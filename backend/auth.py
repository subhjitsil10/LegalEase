import os
import random
import string
import time
import base64
import smtplib
from io import BytesIO
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from captcha.image import ImageCaptcha
from gtts import gTTS
import jwt
from dotenv import load_dotenv
from database import get_db

# Load environment
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(dotenv_path)

GMAIL_USER = os.getenv("GMAIL_USER", "")
GMAIL_PWD = os.getenv("GMAIL_APP_PASSWORD", "")
JWT_SECRET = os.getenv("JWT_SECRET", "legaltech_jwt_secret_key_2026_secure")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_SECONDS = 7 * 24 * 60 * 60  # 7 days

def generate_captcha_text(length=5):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def generate_captcha_assets():
    text = generate_captcha_text()
    
    # 1. Visual CAPTCHA Image (base64)
    image = ImageCaptcha(width=260, height=80)
    data = image.generate(text)
    image_b64 = base64.b64encode(data.getvalue()).decode('utf-8')
    image_data_uri = f"data:image/png;base64,{image_b64}"
    
    # 2. Audio CAPTCHA (base64 MP3)
    audio_data_uri = None
    try:
        spaced_text = ' '.join(list(text))
        tts = gTTS(text=f"The verification code is: {spaced_text}", lang='en', slow=True)
        fp = BytesIO()
        tts.write_to_fp(fp)
        fp.seek(0)
        audio_b64 = base64.b64encode(fp.getvalue()).decode('utf-8')
        audio_data_uri = f"data:audio/mp3;base64,{audio_b64}"
    except Exception as e:
        print(f"Audio CAPTCHA error: {e}")
        
    return {
        "captcha_text": text,
        "image_url": image_data_uri,
        "audio_url": audio_data_uri
    }

def send_real_otp_email(receiver_email, otp_code):
    try:
        if not GMAIL_USER or not GMAIL_PWD:
            print("Warning: GMAIL credentials missing in environment variables.")
            return False
            
        msg = MIMEMultipart()
        msg['From'] = f"LegalEase Security <{GMAIL_USER}>"
        msg['To'] = receiver_email
        msg['Subject'] = "Your Secure Verification Code • LegalEase"
        
        body = f"""Hello,

Your secure 4-digit verification code is: {otp_code}

Use this code to complete your access to LegalEase. This code will expire shortly.

If you did not request this code, please ignore this email.

Best regards,
LegalEase Security Team
"""
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(GMAIL_USER, GMAIL_PWD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"SMTP Error: {e}")
        return False

def create_access_token(user_data: dict) -> str:
    payload = {
        "sub": user_data["email"],
        "id": user_data["id"],
        "user_name": user_data.get("full_name", ""),
        "exp": time.time() + JWT_EXPIRATION_SECONDS
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except Exception:
        return None

def get_user_by_email(email: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()
    if user:
        return dict(user)
    return None

def get_user_by_id(user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    if user:
        return dict(user)
    return None
