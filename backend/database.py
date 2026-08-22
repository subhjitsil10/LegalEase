import sqlite3
import os
import json
import time

if os.environ.get("VERCEL"):
    DB_PATH = "/tmp/legaltech.db"
else:
    DB_PATH = os.path.join(os.path.dirname(__file__), "legaltech.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT DEFAULT '',
        phone_number TEXT DEFAULT '',
        age INTEGER DEFAULT 24,
        profession TEXT DEFAULT 'Student',
        org_name TEXT DEFAULT '',
        avatar_url TEXT DEFAULT '',
        is_subscribed BOOLEAN DEFAULT 0,
        subscription_plan TEXT DEFAULT 'Free Tier',
        doc_upload_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Pending OTP verifications table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS pending_otps (
        email TEXT PRIMARY KEY,
        otp_code TEXT NOT NULL,
        captcha_text TEXT NOT NULL,
        created_at REAL NOT NULL
    )
    """)
    
    # Revenue Ledger / Subscriptions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS revenue_ledger (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id TEXT UNIQUE NOT NULL,
        email TEXT NOT NULL,
        plan_name TEXT NOT NULL,
        amount_inr REAL NOT NULL,
        payment_method TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'COMPLETED'
    )
    """)
    
    # Audits history table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS document_audits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        filename TEXT NOT NULL,
        language TEXT DEFAULT 'English',
        report_text TEXT NOT NULL,
        audio_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    """)
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at", DB_PATH)
