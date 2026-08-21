# ⚖️ LegalTech AI • Enterprise Legal Document Intelligence

An autonomous, multi-modal Legal Intelligence & Playbook Compliance platform built with **Streamlit** and powered by **Google Gemini 3.6 Flash**. 

Designed to instantly audit contracts, leases, NDAs, and employment agreements against bar-standard legal playbooks, flag hidden risks and unfair clauses, synthesize audio executive summaries, and provide an interactive AI legal counsel assistant.

---

## ✨ Features

- 🌌 **Eye-Soothing Aurora Mesh Gradient UI**: Modern, liquid glassmorphic design with subtle glowing light orbs, frosted crystal acrylic cards, and clean typography.
- 👀 **Website Preview & Contextual Auth Flow**: Guest users can preview all platform features, sample playbooks, and supported document classes on load. Interacting with upload/scan triggers a secure modal popup.
- 🔐 **Multi-Factor Verification & Real OTP**: Complete 3-step authentication with visual/audio CAPTCHA, real SMTP-dispatched 4-digit OTP with countdown timer, and profile setup.
- 🛡️ **Phase 0 Strict Legal Document Verification**: Strictly rejects non-legal files (memes, scenery, food, receipts, notes) with standard safety messages without leaking or describing image details.
- 📑 **Comprehensive Legal Playbook Auditing**: Evaluates non-competes, IP assignments, unilateral termination, unlimited liability, rent escalation, and jurisdictional clauses.
- 🌐 **Multilingual Output**: Fluent generation in **English**, **Hindi (हिंदी)**, and **Bangla (বাংলা)**.
- 🔊 **Voice Synthesis**: Generates instant audio briefings of the legal audit report via `gTTS`.
- 💬 **Interactive AI Legal Counsel**: Context-aware legal Q&A chatbot to interrogate specific clauses, phrasing, and legal implications in real-time.

---

## 🛠️ Tech Stack

- **Frontend & App Framework**: [Streamlit](https://streamlit.io/)
- **LLM / Multimodal AI**: [Google GenAI SDK](https://github.com/google/generative-ai-python) (`gemini-3.6-flash`)
- **Security & CAPTCHA**: `captcha` (Image & Audio), `smtplib` (Real OTP Delivery)
- **Audio Processing**: `gTTS` (Google Text-to-Speech)
- **Environment Management**: `python-dotenv`

---

## 🚀 Quickstart Guide

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
```

### 2. Set Up Virtual Environment
```bash
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):
```env
GEMINI_API_KEY=your_gemini_api_key_here
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_digit_app_password_here
```

### 5. Launch the Application
```bash
streamlit run app.py
```

---

## 🔒 Security & Privacy Notice
- Documents uploaded for analysis are processed via temporary session buffers and purged immediately after completion.
- API keys, credentials, and email credentials are never stored or hardcoded into the repository.
- Disclaimer: This tool utilizes advanced language models and standard playbooks to identify potential contract risks. It does **not** substitute binding legal advice from a certified attorney.

---

## 📄 License
MIT License. Open for educational, hackathon, and non-commercial development.
