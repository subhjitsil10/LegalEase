import os
import time
import json
import random
from typing import Optional
from fastapi import FastAPI, HTTPException, Depends, Header, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr

from database import init_db, get_db
from auth import (
    generate_captcha_assets, send_real_otp_email, create_access_token,
    decode_access_token, get_user_by_email, get_user_by_id
)
from ai_service import analyze_legal_document, chat_with_legal_counsel

app = FastAPI(title="LegalEase - Enterprise Legal Intelligence API", version="2.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploads static directory for user profile avatars
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# Initialize database tables on startup
@app.on_event("startup")
def startup_event():
    init_db()

# Dependency to extract and verify authenticated user
def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        return None
    user = get_user_by_id(payload.get("id"))
    return user

# ==========================================
# AUTHENTICATION ENDPOINTS
# ==========================================

@app.get("/api/auth/captcha")
def get_captcha():
    """Generates visual and audio CAPTCHA assets."""
    assets = generate_captcha_assets()
    return assets

class RequestOtpRequest(BaseModel):
    email: EmailStr
    captcha_token: str  # Original CAPTCHA
    captcha_input: str  # User typed CAPTCHA

@app.post("/api/auth/request-otp")
def request_otp(req: RequestOtpRequest):
    """Verifies CAPTCHA and sends a 4-digit OTP to the user's email."""
    if req.captcha_input.strip().upper() != req.captcha_token.strip().upper():
        raise HTTPException(status_code=400, detail="CAPTCHA verification failed. Please try again.")
        
    otp_code = str(random.randint(1000, 9999))
    
    # Save pending OTP in database
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO pending_otps (email, otp_code, captcha_text, created_at)
        VALUES (?, ?, ?, ?)
    """, (req.email.lower().strip(), otp_code, req.captcha_token, time.time()))
    conn.commit()
    conn.close()
    
    # Dispatch real email
    sent = send_real_otp_email(req.email.lower().strip(), otp_code)
    if not sent:
        raise HTTPException(status_code=500, detail="Failed to dispatch verification email. Please check server SMTP configuration.")
        
    return {"success": True, "message": f"Verification code dispatched to {req.email}"}

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp_code: str

@app.post("/api/auth/verify-otp")
def verify_otp(req: VerifyOtpRequest):
    """Verifies 4-digit code. If user exists, returns JWT token; if new, prompts profile completion."""
    email_clean = req.email.lower().strip()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM pending_otps WHERE email = ?", (email_clean,))
    pending = cursor.fetchone()
    
    if not pending:
        conn.close()
        raise HTTPException(status_code=400, detail="No pending verification found for this email.")
        
    if pending["otp_code"] != req.otp_code.strip():
        conn.close()
        raise HTTPException(status_code=400, detail="Invalid 4-digit verification code.")
        
    # Check if user already registered
    cursor.execute("SELECT * FROM users WHERE email = ?", (email_clean,))
    existing_user = cursor.fetchone()
    conn.close()
    
    if existing_user:
        user_dict = dict(existing_user)
        token = create_access_token(user_dict)
        return {
            "success": True,
            "is_new_user": False,
            "token": token,
            "user": user_dict
        }
    else:
        return {
            "success": True,
            "is_new_user": True,
            "email": email_clean
        }

class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str
    phone_number: str
    age: int = 24
    profession: str = "Student"
    org_name: Optional[str] = ""

@app.post("/api/auth/register")
def register_user(req: RegisterRequest):
    """Creates a new user profile with extended information and returns JWT access token."""
    email_clean = req.email.lower().strip()
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO users (email, full_name, phone_number, age, profession, org_name)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (email_clean, req.full_name.strip(), req.phone_number.strip(), req.age, req.profession, req.org_name.strip()))
    
    user_id = cursor.lastrowid
    cursor.execute("DELETE FROM pending_otps WHERE email = ?", (email_clean,))
    conn.commit()
    
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    new_user = dict(cursor.fetchone())
    conn.close()
    
    token = create_access_token(new_user)
    return {
        "success": True,
        "token": token,
        "user": new_user
    }

@app.get("/api/auth/me")
def get_me(user = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"success": True, "user": user}

class UpdateProfileRequest(BaseModel):
    full_name: str
    phone_number: str
    age: int
    profession: str
    org_name: Optional[str] = ""

@app.put("/api/auth/profile")
def update_profile(req: UpdateProfileRequest, user = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE users 
        SET full_name = ?, phone_number = ?, age = ?, profession = ?, org_name = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    """, (req.full_name.strip(), req.phone_number.strip(), req.age, req.profession, req.org_name.strip(), user["id"]))
    conn.commit()
    
    cursor.execute("SELECT * FROM users WHERE id = ?", (user["id"],))
    updated_user = dict(cursor.fetchone())
    conn.close()
    
    return {"success": True, "user": updated_user}

@app.post("/api/auth/avatar")
async def upload_avatar(file: UploadFile = File(...), user = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "png"
    avatar_filename = f"avatar_user_{user['id']}_{int(time.time())}.{ext}"
    avatar_path = os.path.join(UPLOADS_DIR, avatar_filename)
    
    contents = await file.read()
    with open(avatar_path, "wb") as f:
        f.write(contents)
        
    avatar_url = f"/uploads/{avatar_filename}"
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET avatar_url = ? WHERE id = ?", (avatar_url, user["id"]))
    conn.commit()
    conn.close()
    
    return {"success": True, "avatar_url": avatar_url}

# ==========================================
# DOCUMENT INTELLIGENCE & AUDITING
# ==========================================

@app.post("/api/documents/analyze")
async def analyze_document(
    file: UploadFile = File(...),
    language: str = Form("English"),
    user = Depends(get_current_user)
):
    """Audits document against standardized legal playbook and enforces 3-free audit quota."""
    # Check subscription quota
    if user:
        is_sub = bool(user.get("is_subscribed", False))
        upload_count = int(user.get("doc_upload_count", 0))
        if not is_sub and upload_count >= 3:
            return {
                "success": False,
                "quota_exceeded": True,
                "error": "You have utilized all 3 free document compliance audits. Upgrade to Pro Monthly (₹499/mo) or Annual (₹5,000/yr) to continue auditing documents."
            }
            
    file_bytes = await file.read()
    filename = file.filename or "uploaded_document.pdf"
    
    result = analyze_legal_document(file_bytes, filename, language)
    
    # If successful & authentic legal doc, increment user's audit counter
    if result.get("success") and result.get("is_legal") and user:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET doc_upload_count = doc_upload_count + 1 WHERE id = ?", (user["id"],))
        
        # Save audit record
        cursor.execute("""
            INSERT INTO document_audits (user_id, filename, language, report_text, audio_url)
            VALUES (?, ?, ?, ?, ?)
        """, (user["id"], filename, language, result.get("report", ""), result.get("audio_url", "")))
        
        conn.commit()
        
        # Fetch updated user count
        cursor.execute("SELECT doc_upload_count, is_subscribed FROM users WHERE id = ?", (user["id"],))
        row = cursor.fetchone()
        conn.close()
        
        result["doc_upload_count"] = row["doc_upload_count"]
        result["is_subscribed"] = bool(row["is_subscribed"])
        
    return result

class ChatRequest(BaseModel):
    query: str
    doc_temp_path: Optional[str] = None
    language: str = "English"

@app.post("/api/chat")
def chat_counsel(req: ChatRequest):
    """Universal 24/7 AI Legal Counsel endpoint."""
    res = chat_with_legal_counsel(req.query, req.doc_temp_path, req.language)
    return res

# ==========================================
# BILLING & SUBSCRIPTION
# ==========================================

@app.get("/api/billing/plans")
def get_plans():
    return {
        "success": True,
        "plans": [
            {
                "id": "pro_monthly",
                "name": "Pro Monthly Plan",
                "price": 499,
                "period": "month",
                "features": [
                    "Unlimited Legal Document Audits",
                    "Priority GenAI Flash Processing",
                    "Instant Multilingual Voice Reports (EN, HI, BN)",
                    "24/7 AI Legal Counsel Chatbot Access",
                    "Bar-Standard Risk Severity Tagging"
                ]
            },
            {
                "id": "enterprise_annual",
                "name": "Enterprise Annual Plan",
                "price": 5000,
                "period": "year",
                "badge": "⭐ BEST VALUE • SAVE 17%",
                "features": [
                    "Everything in Pro + 2 Months Free Access",
                    "Custom Law Firm Playbook Tuning",
                    "Batch Multi-Contract Compliance Auditing",
                    "Dedicated SLA & Fast Lane Support",
                    "Annual Legal Risk Mitigation Audit Summary"
                ]
            }
        ]
    }

class CheckoutRequest(BaseModel):
    plan_name: str
    amount_inr: float
    payment_method: str = "UPI (Google Pay / PhonePe)"

@app.post("/api/billing/checkout")
def process_checkout(req: CheckoutRequest, user = Depends(get_current_user)):
    """Simulates/processes payment and updates user subscription status."""
    email = user["email"] if user else "guest@legaltech.ai"
    txn_id = f"TXN_{int(time.time())}_{random.randint(1000, 9999)}"
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO revenue_ledger (transaction_id, email, plan_name, amount_inr, payment_method, status)
        VALUES (?, ?, ?, ?, ?, 'COMPLETED')
    """, (txn_id, email, req.plan_name, req.amount_inr, req.payment_method))
    
    if user:
        cursor.execute("""
            UPDATE users 
            SET is_subscribed = 1, subscription_plan = ?
            WHERE id = ?
        """, (req.plan_name, user["id"]))
        
    conn.commit()
    conn.close()
    
    return {
        "success": True,
        "transaction_id": txn_id,
        "plan_name": req.plan_name,
        "amount_inr": req.amount_inr,
        "message": f"🎉 Subscription successfully activated for {email}!"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
