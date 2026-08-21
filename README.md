# ⚖️ LegalTech AI • Enterprise Legal Intelligence Platform

An enterprise-grade, autonomous legal document intelligence and contract compliance platform. Powered by **Google Gemini 3.6 Flash**, **FastAPI (Python)**, and **React + Vite + Tailwind CSS**.

Featuring an eye-soothing **Aurora Mesh Gradient** with liquid frosted glass surfaces, multi-user authentication with visual & audio CAPTCHA, real 256-bit email OTP, persistent SQLite profiles, 3-document free tier quota, and a subscription revenue ledger.

---

## 🌟 Key Architecture & Capabilities

1. **⚡ Full-Stack Multi-User Architecture**:
   - **Frontend**: React + Vite + Tailwind CSS + Lucide Icons. Fluid single-popup modals with zero full-page reload glitches.
   - **Backend**: FastAPI (Python 3.14) asynchronous REST API with SQLite multi-user database (`legaltech.db`).
   - **Authentication**: Passwordless verification with visual Image CAPTCHA, Audio Code playback, and real Gmail SMTP 4-digit OTP.

2. **🛡️ Centralized Legal Audit Playbook**:
   - **Non-Compete & Restraints of Trade**: Audits post-termination duration, radius, and Indian Contract Act Section 27 unenforceability.
   - **Intellectual Property (IP) Assignment**: Flags overbroad claims to personal side projects and pre-existing work.
   - **Termination & Notice**: Detects unilateral cancellation and enforces 30-day bilateral notice minimums.
   - **Indemnification & Liability Caps**: Eliminates unlimited personal liabilities.

3. **🚫 Strict Phase 0 Legal Document Validation**:
   - Rejects non-legal files (e.g. food photos, resumes, receipts, memes, landscapes) with the exact standardized message:
     ```text
     This is not a legal document please upload the correect one
     ```

4. **💎 Subscription & Revenue Architecture**:
   - **Free Starter**: 3 Document Compliance Audits.
   - **Pro Monthly (₹499 / month)**: Unlimited Document Audits, Priority GenAI Flash Speed, Full Voice Synthesis, 24/7 AI Legal Counsel.
   - **Enterprise Annual (₹5,000 / year)**: Unlimited Everything + 2 Months Free (Save 17%) + Custom Firm Playbook Tuning.
   - Backend ledger `revenue_ledger.json` securely tracks all financial transactions and payment methods (UPI, Cards, Net Banking).

5. **🔊 Multilingual Voice Synthesis & AI Legal Counsel**:
   - Generates instant audio briefings in English, Hindi (हिंदी), and Bangla (বাংলা) with `gTTS`.
   - Universal 24/7 AI Legal Counsel chatbot for general questions or clause-by-clause document interrogation.

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Environment Configuration
Create a `.env` file in the root folder:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password_here
JWT_SECRET=your_jwt_secret_key_here
```

### 2. Start the Full-Stack Application
Using PowerShell:
```powershell
.\run.ps1
```
Or manually:
```bash
# Terminal 1: Backend
python backend/main.py

# Terminal 2: Frontend
cd frontend
npm run dev
```

- **Frontend UI**: `http://localhost:5173`
- **FastAPI Backend & Interactive API Docs**: `http://localhost:8000/docs`

---

## 📁 Project Structure

```text
├── backend/
│   ├── main.py              # FastAPI REST API endpoints
│   ├── database.py          # SQLite database schema & connection
│   ├── auth.py              # Visual/Audio CAPTCHA, SMTP OTP, JWT
│   ├── ai_service.py        # Gemini 3.6 Flash integration & audio
│   ├── playbook.py          # Centralized legal playbook rules
│   └── requirements.txt     # Python backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Hero, Workspace, Chatbot, Pricing, Footer
│   │   ├── modals/          # AuthModal, ProfileModal, SubscriptionModal
│   │   ├── api.js           # Centralized API client
│   │   ├── App.jsx          # Main application container
│   │   └── index.css        # Aurora mesh gradient & liquid glass styles
│   └── package.json
├── run.ps1                  # 1-click startup script
├── start.bat                # Windows launcher
├── .env.example
├── .gitignore
└── README.md
```
