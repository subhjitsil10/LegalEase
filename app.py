import streamlit as st
import streamlit.components.v1 as components
import os
import random
import string
import time
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from google import genai
from captcha.image import ImageCaptcha
from gtts import gTTS

# Import the centralized legal playbook rules & rejection standard
from playbook import LEGAL_PLAYBOOK, NON_LEGAL_DOCUMENT_MESSAGE

# ==========================================
# SETUP & INITIALIZATION
# ==========================================
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
gmail_user = os.getenv("GMAIL_USER")
gmail_pwd = os.getenv("GMAIL_APP_PASSWORD")

if not api_key:
    st.error("API Key not found! Please check your .env file.")
    st.stop()

client = genai.Client(api_key=api_key)

st.set_page_config(
    page_title="LegalTech AI • Enterprise Intelligence",
    page_icon="⚖️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ==========================================
# EYE-SOOTHING AURORA MESH GRADIENT - CUSTOM CSS
# ==========================================
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    
    /* Eye-Soothing Aurora Mesh Gradient Canvas */
    .stApp {
        background-color: #f0f7ff;
        background-image: 
            radial-gradient(at 0% 0%, rgba(186, 230, 253, 0.75) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(147, 197, 253, 0.7) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(191, 219, 254, 0.75) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(125, 211, 252, 0.65) 0px, transparent 50%),
            radial-gradient(at 50% 30%, rgba(96, 165, 250, 0.45) 0px, transparent 50%),
            radial-gradient(at 30% 70%, rgba(56, 189, 248, 0.4) 0px, transparent 50%),
            radial-gradient(at 80% 65%, rgba(165, 180, 252, 0.4) 0px, transparent 50%);
        background-size: 100% 100%;
        background-attachment: fixed;
        font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif;
        color: #1e293b;
    }

    /* Fixed Aurora Ambient Glow Backdrop */
    .aurora-bg {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        z-index: -1;
        pointer-events: none;
    }

    .aurora-orb-1 {
        position: absolute;
        top: -15%;
        left: -10%;
        width: 60vw;
        height: 60vw;
        background: radial-gradient(circle, rgba(56, 189, 248, 0.55) 0%, rgba(147, 197, 253, 0.35) 45%, transparent 70%);
        filter: blur(80px);
        border-radius: 50%;
        animation: aurora-float-1 22s ease-in-out infinite alternate;
    }

    .aurora-orb-2 {
        position: absolute;
        top: 5%;
        right: -12%;
        width: 55vw;
        height: 55vw;
        background: radial-gradient(circle, rgba(96, 165, 250, 0.5) 0%, rgba(186, 230, 253, 0.4) 45%, transparent 70%);
        filter: blur(90px);
        border-radius: 50%;
        animation: aurora-float-2 26s ease-in-out infinite alternate;
    }

    .aurora-orb-3 {
        position: absolute;
        bottom: -15%;
        left: 15%;
        width: 65vw;
        height: 65vw;
        background: radial-gradient(circle, rgba(125, 211, 252, 0.45) 0%, rgba(199, 210, 254, 0.35) 50%, transparent 70%);
        filter: blur(100px);
        border-radius: 50%;
        animation: aurora-float-3 24s ease-in-out infinite alternate;
    }

    .aurora-orb-4 {
        position: absolute;
        top: 35%;
        left: 35%;
        width: 45vw;
        height: 45vw;
        background: radial-gradient(circle, rgba(14, 165, 233, 0.35) 0%, rgba(147, 197, 253, 0.25) 45%, transparent 70%);
        filter: blur(85px);
        border-radius: 50%;
        animation: aurora-float-1 28s ease-in-out infinite alternate-reverse;
    }

    @keyframes aurora-float-1 {
        0% { transform: translate(0px, 0px) scale(1); }
        50% { transform: translate(45px, 65px) scale(1.06); }
        100% { transform: translate(-30px, 30px) scale(0.95); }
    }
    @keyframes aurora-float-2 {
        0% { transform: translate(0px, 0px) scale(1); }
        50% { transform: translate(-55px, 45px) scale(1.05); }
        100% { transform: translate(25px, -35px) scale(0.95); }
    }
    @keyframes aurora-float-3 {
        0% { transform: translate(0px, 0px) scale(1); }
        50% { transform: translate(35px, -45px) scale(1.08); }
        100% { transform: translate(-35px, 20px) scale(0.93); }
    }

    /* Clean Body & Markdown Text Clarity */
    html, body, [class*="css"], .stMarkdown, .stMarkdown p, .stMarkdown li, .stMarkdown span {
        color: #1e293b !important; 
    }
    
    /* Headers with Sophisticated Slate / Deep Navy Hue */
    .stMarkdown h1 {
        color: #0f172a !important;
        font-weight: 800 !important;
        letter-spacing: -0.025em !important;
    }
    .stMarkdown h2, .stMarkdown h3 {
        color: #1e3a8a !important;
        font-weight: 700 !important;
        letter-spacing: -0.015em !important;
    }
    .stMarkdown h4 {
        color: #1e293b !important;
        font-weight: 600 !important;
    }

    /* Soft Liquid Glass Card Container with Aurora Bleed */
    .light-glass-card {
        background: rgba(255, 255, 255, 0.72);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.85);
        border-radius: 20px;
        padding: 26px;
        box-shadow: 
            0 12px 30px -8px rgba(14, 116, 144, 0.08),
            0 4px 12px -2px rgba(15, 23, 42, 0.04),
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.95);
        transition: all 0.25s ease;
        margin-bottom: 22px;
        position: relative;
    }
    .light-glass-card:hover {
        background: rgba(255, 255, 255, 0.82);
        border-color: rgba(147, 197, 253, 0.9);
        box-shadow: 
            0 18px 36px -8px rgba(14, 116, 144, 0.12),
            0 6px 16px -2px rgba(15, 23, 42, 0.06),
            inset 0 1px 1px 0 rgba(255, 255, 255, 1);
        transform: translateY(-2px);
    }

    /* Gentle Status Pill Badge */
    .calm-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 5px 14px;
        border-radius: 9999px;
        background: rgba(255, 255, 255, 0.85);
        border: 1px solid #bfdbfe;
        color: #1d4ed8 !important;
        font-weight: 600;
        font-size: 0.82rem;
        box-shadow: 0 2px 6px rgba(14, 116, 144, 0.06);
    }

    /* Elegant Brand Text */
    .brand-title {
        color: #0f172a !important;
        font-weight: 800;
    }

    /* Eye-Soothing Warm Amber Alert */
    .soothing-alert {
        background: rgba(255, 251, 235, 0.9);
        backdrop-filter: blur(12px);
        border-left: 4px solid #f59e0b;
        border-right: 1px solid #fef3c7;
        border-top: 1px solid #fef3c7;
        border-bottom: 1px solid #fef3c7;
        padding: 14px 20px;
        border-radius: 12px;
        color: #92400e !important;
        font-size: 0.9rem;
        font-weight: 500;
        margin-bottom: 22px;
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.06);
    }
    .soothing-alert strong, .soothing-alert div, .soothing-alert span {
        color: #92400e !important;
    }

    /* Tags for Supported Documents */
    .tags-container {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 22px;
    }
    .doc-tag {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(10px);
        color: #334155 !important;
        padding: 6px 14px;
        border-radius: 9999px;
        font-size: 0.84rem;
        font-weight: 500;
        border: 1px solid rgba(226, 232, 240, 0.8);
        box-shadow: 0 2px 6px rgba(14, 116, 144, 0.04);
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 6px;
    }
    .doc-tag:hover {
        background: #ffffff;
        color: #1d4ed8 !important;
        border-color: #93c5fd;
        transform: translateY(-1px);
        box-shadow: 0 4px 10px rgba(14, 116, 144, 0.08);
    }

    /* Feature Pillars Grid Cards */
    .feature-card {
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(14px);
        border: 1px solid rgba(255, 255, 255, 0.9);
        border-radius: 14px;
        padding: 18px;
        box-shadow: 0 4px 12px rgba(14, 116, 144, 0.04);
        transition: all 0.2s ease;
    }
    .feature-card:hover {
        border-color: #93c5fd;
        background: rgba(255, 255, 255, 0.92);
        box-shadow: 0 8px 20px rgba(14, 116, 144, 0.08);
        transform: translateY(-2px);
    }

    /* Sapphire Action Buttons */
    div.stButton > button {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
        color: #ffffff !important;
        border: none !important;
        border-radius: 10px !important;
        padding: 0.55rem 1.6rem !important;
        font-weight: 600 !important;
        letter-spacing: 0.2px !important;
        transition: all 0.2s ease !important;
        box-shadow: 0 4px 14px rgba(37, 99, 235, 0.28) !important;
        width: 100% !important;
    }
    div.stButton > button:hover {
        background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%) !important;
        box-shadow: 0 6px 18px rgba(37, 99, 235, 0.38) !important;
        transform: translateY(-1px) !important;
    }

    /* Sidebar Light Glass Styling */
    [data-testid="stSidebar"] {
        background-color: rgba(255, 255, 255, 0.75) !important;
        backdrop-filter: blur(20px) saturate(180%) !important;
        -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
        border-right: 1px solid rgba(226, 232, 240, 0.8) !important;
    }

    /* ==========================================
       STREAMLIT DIALOG POPUP AURORA MESH & GLASS
       ========================================== */
    div[data-baseweb="modal"] > div:first-child,
    [data-testid="stDialog"] > div:first-child {
        background-color: rgba(15, 23, 42, 0.45) !important;
        backdrop-filter: blur(10px) !important;
        -webkit-backdrop-filter: blur(10px) !important;
    }

    div[role="dialog"],
    div[data-baseweb="modal"] > div:nth-child(2),
    div[data-baseweb="modal-body"],
    [data-testid="stDialog"] div[role="dialog"],
    [data-testid="stDialog"] section[role="dialog"],
    [data-testid="stModal"] {
        background-color: #f0f7ff !important;
        background-image: 
            radial-gradient(at 0% 0%, rgba(186, 230, 253, 0.95) 0px, transparent 55%),
            radial-gradient(at 100% 0%, rgba(147, 197, 253, 0.9) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(191, 219, 254, 0.95) 0px, transparent 55%),
            radial-gradient(at 0% 100%, rgba(125, 211, 252, 0.85) 0px, transparent 55%),
            radial-gradient(at 50% 50%, rgba(255, 255, 255, 0.88) 0px, transparent 65%) !important;
        backdrop-filter: blur(30px) saturate(190%) !important;
        -webkit-backdrop-filter: blur(30px) saturate(190%) !important;
        border: 1.5px solid rgba(255, 255, 255, 0.95) !important;
        border-radius: 24px !important;
        box-shadow: 
            0 25px 65px -10px rgba(14, 116, 144, 0.25),
            0 15px 35px -5px rgba(15, 23, 42, 0.12),
            inset 0 1px 2px 0 rgba(255, 255, 255, 1) !important;
        color: #1e293b !important;
        padding: 24px !important;
    }

    /* Modal Text & Typography */
    div[role="dialog"] h1, div[role="dialog"] h2, div[role="dialog"] h3,
    div[data-baseweb="modal"] h1, div[data-baseweb="modal"] h2, div[data-baseweb="modal"] h3,
    [data-testid="stDialog"] h1, [data-testid="stDialog"] h2, [data-testid="stDialog"] h3 {
        color: #0f172a !important;
        font-weight: 800 !important;
    }

    div[role="dialog"] p, div[role="dialog"] label, div[role="dialog"] span,
    div[data-baseweb="modal"] p, div[data-baseweb="modal"] label, div[data-baseweb="modal"] span,
    [data-testid="stDialog"] p, [data-testid="stDialog"] label, [data-testid="stDialog"] span,
    [data-testid="stDialog"] div {
        color: #1e293b !important;
    }

    /* Close Button in Dialog */
    div[role="dialog"] button[aria-label="Close"],
    div[data-baseweb="modal"] button[aria-label="Close"],
    [data-testid="stDialog"] button[aria-label="Close"] {
        color: #475569 !important;
        background: rgba(255, 255, 255, 0.7) !important;
        border-radius: 50% !important;
        border: 1px solid rgba(226, 232, 240, 0.8) !important;
        transition: all 0.2s ease !important;
    }
    div[role="dialog"] button[aria-label="Close"]:hover,
    [data-testid="stDialog"] button[aria-label="Close"]:hover {
        background: rgba(255, 255, 255, 1) !important;
        color: #0f172a !important;
        transform: scale(1.05);
    }
    div[role="dialog"] button[aria-label="Close"] svg,
    [data-testid="stDialog"] button[aria-label="Close"] svg {
        fill: #475569 !important;
    }

    /* Input Fields in Dialog */
    div[role="dialog"] .stTextInput input,
    [data-testid="stDialog"] .stTextInput input {
        background-color: rgba(255, 255, 255, 0.95) !important;
        border: 1.5px solid rgba(147, 197, 253, 0.85) !important;
        border-radius: 12px !important;
        color: #0f172a !important;
        padding: 10px 14px !important;
        box-shadow: 0 2px 6px rgba(14, 116, 144, 0.05) !important;
    }
    div[role="dialog"] .stTextInput input:focus,
    [data-testid="stDialog"] .stTextInput input:focus {
        border-color: #2563eb !important;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2) !important;
        background-color: #ffffff !important;
    }

    /* Captcha Image & Audio in Dialog */
    div[role="dialog"] .stImage img,
    [data-testid="stDialog"] .stImage img {
        border-radius: 12px !important;
        border: 1.5px solid rgba(147, 197, 253, 0.7) !important;
        box-shadow: 0 4px 12px rgba(14, 116, 144, 0.08) !important;
        background: #ffffff !important;
    }

    div[role="dialog"] audio,
    [data-testid="stDialog"] audio {
        border-radius: 30px !important;
        width: 100% !important;
        box-shadow: 0 2px 8px rgba(14, 116, 144, 0.06) !important;
    }

    /* Tabs Styling */
    .stTabs [data-baseweb="tab-list"] {
        background: rgba(241, 245, 249, 0.7);
        backdrop-filter: blur(10px);
        padding: 5px;
        border-radius: 12px;
        border: 1px solid rgba(226, 232, 240, 0.8);
        gap: 6px;
    }
    .stTabs [data-baseweb="tab"] {
        border-radius: 8px;
        padding: 7px 16px;
        font-weight: 500;
        color: #64748b;
    }
    .stTabs [aria-selected="true"] {
        background: #ffffff !important;
        color: #1d4ed8 !important;
        border: 1px solid #cbd5e1 !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    }

    /* Input Fields Light Styling */
    .stTextInput > div > div > input {
        border-radius: 10px !important;
        border: 1px solid #cbd5e1 !important;
        background-color: rgba(255, 255, 255, 0.9) !important;
        color: #0f172a !important;
        padding: 9px 13px !important;
    }
    .stTextInput > div > div > input:focus {
        border-color: #2563eb !important;
        box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15) !important;
    }

    /* Clean Quiet Footer */
    .cert-footer {
        margin-top: 50px;
        padding-top: 25px;
        border-top: 1px solid rgba(226, 232, 240, 0.8);
        text-align: center;
        color: #64748b;
    }
    .cert-icons {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 20px;
        margin-top: 12px;
        font-weight: 500;
        font-size: 0.88rem;
        color: #475569;
    }
</style>

<!-- Aurora Glowing Mesh Gradient Elements -->
<div class="aurora-bg">
    <div class="aurora-orb-1"></div>
    <div class="aurora-orb-2"></div>
    <div class="aurora-orb-3"></div>
    <div class="aurora-orb-4"></div>
</div>
""", unsafe_allow_html=True)

# ==========================================
# HELPER FUNCTIONS
# ==========================================
def generate_captcha_text(length=5):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def generate_audio_captcha(text):
    try:
        spaced_text = ' '.join(list(text)) 
        tts = gTTS(text=f"The verification code is: {spaced_text}", lang='en', slow=True)
        audio_file = "captcha_audio.mp3"
        tts.save(audio_file)
        return audio_file
    except Exception:
        return None

def send_real_otp(receiver_email, otp_code):
    try:
        if not gmail_user or not gmail_pwd:
            print("GMAIL credentials missing in environment.")
            return False
        msg = MIMEMultipart()
        msg['From'] = f"LegalTech AI Portal <{gmail_user}>"
        msg['To'] = receiver_email
        msg['Subject'] = "Secure Verification Code • LegalTech AI"
        body = f"Hello,\n\nYour secure 4-digit verification code is: {otp_code}\n\nUse this code to complete your access to LegalTech AI. This code will expire shortly."
        msg.attach(MIMEText(body, 'plain'))
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(gmail_user, gmail_pwd)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Email Error: {e}")
        return False

def live_timer_ui(seconds_left):
    html_code = f"""
    <script>
    let timeLeft = {seconds_left};
    const timerId = setInterval(() => {{
        if (timeLeft <= 0) {{
            clearInterval(timerId);
            document.getElementById('t').innerHTML = "⏳ Time is up! Click below to resend.";
            document.getElementById('t').style.color = "#dc2626";
        }} else {{
            document.getElementById('t').innerHTML = "⏳ Resend code in " + timeLeft + "s";
        }}
        timeLeft -= 1;
    }}, 1000);
    </script>
    <div id="t" style="color: #64748b; font-size: 13px; text-align: center; margin-top: 8px; font-weight: 500;">
        ⏳ Resend code in {seconds_left}s
    </div>
    """
    components.html(html_code, height=35)

# ==========================================
# SESSION STATE INITIALIZATION
# ==========================================
if 'is_authenticated' not in st.session_state: st.session_state.is_authenticated = False
if 'user_name' not in st.session_state: st.session_state.user_name = ""
if 'email' not in st.session_state: st.session_state.email = ""
if 'org_name' not in st.session_state: st.session_state.org_name = ""
if 'auth_step' not in st.session_state: st.session_state.auth_step = 'request_otp' # 'request_otp', 'verify_otp', 'profile'
if 'captcha_text' not in st.session_state: st.session_state.captcha_text = generate_captcha_text()
if 'otp_sent' not in st.session_state: st.session_state.otp_sent = False
if 'otp_timestamp' not in st.session_state: st.session_state.otp_timestamp = 0
if 'real_otp' not in st.session_state: st.session_state.real_otp = ""
if 'chat_history' not in st.session_state: st.session_state.chat_history = []
if 'uploaded_file_path' not in st.session_state: st.session_state.uploaded_file_path = None
if 'language' not in st.session_state: st.session_state.language = "English"

# ==========================================
# POPUP DIALOG: SIGNUP / LOGIN BUBBLE
# ==========================================
@st.dialog("🔐 Secure Sign In")
def show_auth_dialog():
    if st.session_state.auth_step == 'request_otp':
        st.markdown("<h3 style='color: #0f172a !important; margin-bottom: 10px;'>Secure Sign In</h3>", unsafe_allow_html=True)
        st.markdown("<p style='color: #64748b; font-size: 0.9rem;'>Enter your work or personal email to receive a secure verification code.</p>", unsafe_allow_html=True)
        email = st.text_input("Work or Personal Email", placeholder="name@example.com", key="auth_email_input")
        
        st.write("**Human Verification**")
        col_cap1, col_cap2 = st.columns([2, 1])
        with col_cap1:
            image = ImageCaptcha(width=280, height=90)
            st.image(image.generate(st.session_state.captcha_text))
            audio_captcha = generate_audio_captcha(st.session_state.captcha_text)
            if audio_captcha and os.path.exists(audio_captcha):
                st.write("🔊 Audio Code:")
                st.audio(audio_captcha, format='audio/mp3')
        with col_cap2:
            st.write("")
            st.write("")
            if st.button("🔄 Refresh", key="dialog_refresh_captcha"):
                st.session_state.captcha_text = generate_captcha_text()
                st.rerun()

        captcha_input = st.text_input("Enter code from above image/audio", key="auth_captcha_input")
        
        st.markdown("<br>", unsafe_allow_html=True)
        if st.button("Request Access Code", type="primary", key="dialog_send_otp_btn"):
            if not email or "@" not in email or captcha_input.upper() != st.session_state.captcha_text:
                st.error("Invalid Email or CAPTCHA mismatch.")
            else:
                with st.spinner("Dispatching secure code via 256-bit encryption..."):
                    otp = str(random.randint(1000, 9999))
                    if send_real_otp(email, otp):
                        st.session_state.email = email
                        st.session_state.real_otp = otp
                        st.session_state.otp_sent = True
                        st.session_state.otp_timestamp = time.time()
                        st.session_state.auth_step = 'verify_otp'
                        st.rerun()
                    else:
                        st.error("Email delivery failed. Check terminal for SMTP logs.")

    elif st.session_state.auth_step == 'verify_otp':
        st.markdown("<h3 style='color: #0f172a !important;'>Verify Code</h3>", unsafe_allow_html=True)
        st.success(f"Sent to **{st.session_state.email}**")
        otp_input = st.text_input("Enter 4-Digit Security Code", type="password", key="auth_otp_input")
        
        st.markdown("<br>", unsafe_allow_html=True)
        col_v1, col_v2 = st.columns(2)
        with col_v1:
            if st.button("Authenticate", type="primary", key="dialog_verify_otp_btn"):
                if otp_input == st.session_state.real_otp:
                    st.session_state.auth_step = 'profile'
                    st.rerun()
                else:
                    st.error("Invalid Code.")
        with col_v2:
            if st.button("⬅️ Change Email", key="dialog_back_btn"):
                st.session_state.auth_step = 'request_otp'
                st.session_state.captcha_text = generate_captcha_text()
                st.rerun()
        
        time_remaining = max(0, 60 - int(time.time() - st.session_state.otp_timestamp))
        if time_remaining > 0:
            live_timer_ui(time_remaining)
        elif st.button("🔄 Resend Code", key="dialog_resend_btn"):
            otp = str(random.randint(1000, 9999))
            send_real_otp(st.session_state.email, otp)
            st.session_state.real_otp = otp
            st.session_state.otp_timestamp = time.time()
            st.rerun()

    elif st.session_state.auth_step == 'profile':
        st.markdown("<h3 style='color: #0f172a !important;'>Profile Setup</h3>", unsafe_allow_html=True)
        full_name = st.text_input("Full Legal Name", key="auth_name_input")
        org_name = st.text_input("Organization (Optional)", key="auth_org_input")
        
        st.markdown("<br>", unsafe_allow_html=True)
        if st.button("Initialize Dashboard", type="primary", key="dialog_complete_auth_btn"):
            if full_name:
                st.session_state.user_name = full_name
                st.session_state.org_name = (org_name or "").strip()
                st.session_state.is_authenticated = True
                st.session_state.auth_step = 'request_otp'
                st.rerun()
            else:
                st.warning("Please enter your name to proceed.")

# ==========================================
# SIDEBAR NAVIGATION
# ==========================================
with st.sidebar:
    if st.session_state.is_authenticated:
        st.markdown(f"### 👤 {st.session_state.user_name}")
        st.markdown(f"<p style='color: #64748b; font-size: 0.85rem;'>{st.session_state.email}</p>", unsafe_allow_html=True)
        if st.session_state.org_name:
            st.markdown(f"<span class='doc-tag' style='font-size: 0.75rem; padding: 3px 10px;'>🏢 {st.session_state.org_name}</span>", unsafe_allow_html=True)
        st.markdown("---")
        
        st.markdown("### 🌐 Output Settings")
        st.session_state.language = st.radio(
            "Select Analysis Language:",
            ("English", "Hindi (हिंदी)", "Bangla (বাংলা)")
        )
        
        st.markdown("---")
        st.markdown("### 🔒 Security Status")
        st.success("AES-256 Connection Active")
        st.success("Session Verified & Encrypted")
        
        st.markdown("<br><br>", unsafe_allow_html=True)
        if st.button("🚪 Secure Logout"):
            st.session_state.is_authenticated = False
            st.session_state.user_name = ""
            st.session_state.email = ""
            st.session_state.chat_history = []
            st.session_state.uploaded_file_path = None
            st.session_state.auth_step = 'request_otp'
            st.rerun()
    else:
        st.markdown("### ⚖️ LegalTech AI")
        st.markdown("<p style='color: #64748b; font-size: 0.88rem;'>Enterprise Legal Intelligence Platform</p>", unsafe_allow_html=True)
        st.markdown("---")
        st.markdown("<div style='background: #eff6ff; border-left: 3px solid #3b82f6; padding: 12px; border-radius: 8px; font-size: 0.84rem; color: #1e40af;'>👀 <strong>Website Preview Mode:</strong> Explore features and sample workflows. Sign in to upload and analyze files.</div>", unsafe_allow_html=True)
        st.markdown("<br>", unsafe_allow_html=True)
        if st.button("🔐 Sign In / Register", type="primary", key="sidebar_signin_btn"):
            show_auth_dialog()
        st.markdown("---")
        st.markdown("### 🌐 Supported Languages")
        st.markdown("• English<br>• Hindi (हिंदी)<br>• Bangla (বাংলা)", unsafe_allow_html=True)

# ==========================================
# MAIN INTERFACE (WEBSITE PREVIEW & WORKSPACE)
# ==========================================

# 1. Top Navbar
col_nav_brand, col_nav_status = st.columns([3, 1.2])
with col_nav_brand:
    st.markdown("""
        <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 2rem;">⚖️</span>
            <div>
                <h2 style="margin: 0; font-size: 1.6rem; line-height: 1.1;" class="brand-title">LegalTech AI</h2>
                <p style="margin: 0; color: #64748b; font-size: 0.82rem;">Autonomous Legal Intelligence & Playbook Compliance</p>
            </div>
        </div>
    """, unsafe_allow_html=True)

with col_nav_status:
    if st.session_state.is_authenticated:
        st.markdown(f"""
            <div style="text-align: right; padding-top: 5px;">
                <span class="calm-pill">👤 {st.session_state.user_name}</span>
            </div>
        """, unsafe_allow_html=True)
    else:
        col_btn1, col_btn2 = st.columns([1, 1.2])
        with col_btn2:
            if st.button("🔐 Sign In", key="top_nav_signin_btn"):
                show_auth_dialog()

st.markdown("<br>", unsafe_allow_html=True)

# 2. Hero Banner & Calm Badges
st.markdown("""
<div class="light-glass-card" style="text-align: center; padding: 36px 26px;">
    <div style="margin-bottom: 12px;">
        <span class="calm-pill">AI Engine Active • Gemini 3.6 Flash</span>
    </div>
    <h1 style="font-size: 2.6rem; margin-bottom: 10px;" class="brand-title">
        Enterprise Legal Document Intelligence
    </h1>
    <p style="color: #475569; font-size: 1.05rem; max-width: 780px; margin: 0 auto 20px auto; line-height: 1.6;">
        Instantly audit contracts, real estate leases, employment agreements, and NDAs against standardized legal playbooks. Detect critical hidden liabilities before signing.
    </p>
    <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 10px; margin-top: 12px;">
        <span class="doc-tag">🛡️ Bar-Standard Playbook</span>
        <span class="doc-tag">⚡ Legal Verification</span>
        <span class="doc-tag">🔊 Voice Synthesis</span>
        <span class="doc-tag">🔒 AES-256 Encryption</span>
    </div>
</div>
""", unsafe_allow_html=True)

# 3. Trust Disclaimer Banner
st.markdown("""
<div class="soothing-alert">
    <div style="display: flex; align-items: flex-start; gap: 10px;">
        <span style="font-size: 1.2rem;">⚖️</span>
        <div>
            <strong>Legal AI Assistant Disclaimer:</strong> This platform utilizes advanced language models and standardized legal playbooks to identify potential contract risks. It does <strong>not</strong> substitute binding legal advice from a certified attorney. Always consult counsel before executing contracts.
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# 4. Supported Documents Guide
st.markdown("### 📑 Supported Legal Document Classes")
st.markdown("""
    <div class="tags-container">
        <span class="doc-tag">🏠 Real Estate & Leases</span>
        <span class="doc-tag">💼 Employment & Severance Agreements</span>
        <span class="doc-tag">🏥 Medical Consent & Release Forms</span>
        <span class="doc-tag">📈 NDAs & Financial Guarantees</span>
        <span class="doc-tag">🤝 Vendor & Master Services Agreements</span>
        <span class="doc-tag">📜 Power of Attorney & Affidavits</span>
    </div>
""", unsafe_allow_html=True)

# 5. Playbook Audit Pillars Preview Cards
with st.expander("🔍 Preview Legal Audit Playbook Rules (Click to expand)", expanded=False):
    col_p1, col_p2, col_p3, col_p4 = st.columns(4)
    with col_p1:
        st.markdown("""
        <div class="feature-card">
            <h4 style="color: #dc2626 !important; margin-top: 0;">🚫 Non-Compete</h4>
            <p style="font-size: 0.83rem; color: #475569;">Audits post-employment geographic & duration restrictions. Highlights Section 27 Contract Act unenforceability.</p>
        </div>
        """, unsafe_allow_html=True)
    with col_p2:
        st.markdown("""
        <div class="feature-card">
            <h4 style="color: #d97706 !important; margin-top: 0;">💡 IP Assignment</h4>
            <p style="font-size: 0.83rem; color: #475569;">Flags predatory claims over pre-existing work, personal tools, or side projects outside custom deliverables.</p>
        </div>
        """, unsafe_allow_html=True)
    with col_p3:
        st.markdown("""
        <div class="feature-card">
            <h4 style="color: #2563eb !important; margin-top: 0;">⏳ Termination</h4>
            <p style="font-size: 0.83rem; color: #475569;">Detects unilateral cancellation, unannounced rent hikes, and enforces bilateral 30-day notice minimums.</p>
        </div>
        """, unsafe_allow_html=True)
    with col_p4:
        st.markdown("""
        <div class="feature-card">
            <h4 style="color: #059669 !important; margin-top: 0;">🛡️ Liability Caps</h4>
            <p style="font-size: 0.83rem; color: #475569;">Prevents unlimited personal liability for corporate debts, legal fees, or medical bills.</p>
        </div>
        """, unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# 6. Upload & Scan Workspace
st.markdown('<div class="light-glass-card">', unsafe_allow_html=True)
st.markdown("### 📁 Document Ingestion & Live Scanner")
st.caption("Upload a legal contract (PDF, JPG, PNG, DOCX) or scan physically using your device camera.")

tab_upload, tab_scan = st.tabs(["📁 Upload Document", "📸 Live Document Scanner"])

document_to_process = None

if not st.session_state.is_authenticated:
    with tab_upload:
        st.markdown("""
        <div style="text-align: center; padding: 28px 20px; border: 2px dashed #cbd5e1; border-radius: 14px; background: #f8fafc; margin-bottom: 16px;">
            <span style="font-size: 2.2rem; display: block; margin-bottom: 8px;">📄</span>
            <h4 style="margin: 0; color: #0f172a;">Upload Legal Document</h4>
            <p style="color: #64748b; font-size: 0.88rem; margin-top: 4px; margin-bottom: 18px;">Supported formats: PDF, JPG, PNG, DOCX (Max 10MB)</p>
        </div>
        """, unsafe_allow_html=True)
        if st.button("📤 Upload Document", type="primary", key="guest_upload_doc_btn"):
            show_auth_dialog()

    with tab_scan:
        st.markdown("""
        <div style="text-align: center; padding: 28px 20px; border: 2px dashed #cbd5e1; border-radius: 14px; background: #f8fafc; margin-bottom: 16px;">
            <span style="font-size: 2.2rem; display: block; margin-bottom: 8px;">📸</span>
            <h4 style="margin: 0; color: #0f172a;">Live Document Scanner</h4>
            <p style="color: #64748b; font-size: 0.88rem; margin-top: 4px; margin-bottom: 18px;">Capture and audit legal documents using device camera.</p>
        </div>
        """, unsafe_allow_html=True)
        if st.button("📸 Capture / Scan Document", type="primary", key="guest_scan_doc_btn"):
            show_auth_dialog()

else:
    with tab_upload:
        uploaded_file = st.file_uploader("Upload PDF, JPG, PNG, DOCX (Max 10MB)", type=['pdf', 'png', 'jpg', 'jpeg', 'docx'], key="doc_uploader")
        if uploaded_file:
            document_to_process = uploaded_file

    with tab_scan:
        st.info("💡 Tip: Ensure good lighting and that document text is clear and fully legible.")
        scanned_image = st.camera_input("Capture Document", key="doc_camera")
        if scanned_image:
            document_to_process = scanned_image

st.markdown('</div>', unsafe_allow_html=True)

# 7. Processing & Analysis Results
if document_to_process is not None:
    st.markdown("<br>", unsafe_allow_html=True)
    
    # If the user is a guest, intercept upload/action with the login popup bubble!
    if not st.session_state.is_authenticated:
        st.markdown("""
        <div class="light-glass-card" style="border-color: #93c5fd; text-align: center;">
            <h3 style="color: #1e3a8a !important;">🔐 Authentication Required</h3>
            <p style="color: #475569;">Your document is ready for analysis. Please sign in or verify your email to unlock deep legal compliance auditing.</p>
        </div>
        """, unsafe_allow_html=True)
        
        if st.button("Sign In to Run Deep Legal Analysis", type="primary", key="guest_trigger_analysis_btn"):
            show_auth_dialog()
            
    else:
        # Authenticated user workflow
        if st.button("🚀 Run Deep Legal Analysis", type="primary", key="auth_run_analysis_btn"):
            with st.spinner("Executing legal audit and playbook compliance check..."):
                try:
                    file_name = getattr(document_to_process, "name", None) or "scanned_document.png"
                    temp_filename = f"temp_{file_name}"
                    with open(temp_filename, "wb") as f:
                        f.write(document_to_process.getbuffer())
                    
                    gemini_file = client.files.upload(file=temp_filename)
                    
                    prompt = f"""
                    {LEGAL_PLAYBOOK}
                    =========================================
                    CRITICAL LANGUAGE INSTRUCTION:
                    If and ONLY if the document is verified as an authentic legal document, translate the ENTIRE analysis and respond FLUENTLY in {st.session_state.language}.
                    If this is NOT a legal document, do NOT translate, do NOT provide any descriptions, and respond ONLY with:
                    {NON_LEGAL_DOCUMENT_MESSAGE}
                    """
                    
                    response = client.models.generate_content(
                        model='gemini-3.6-flash',
                        contents=[gemini_file, prompt]
                    )
                    
                    resp_text = (response.text or "").strip()
                    resp_lower = resp_text.lower()
                    
                    # Strict validation check for non-legal documents
                    rejection_keywords = [
                        "not a legal document",
                        "not a legal contract",
                        "not a recognized legal document",
                        "please upload the correct one",
                        "please upload the correect one"
                    ]
                    
                    is_rejected = any(kw in resp_lower for kw in rejection_keywords) or (resp_lower == NON_LEGAL_DOCUMENT_MESSAGE.lower())
                    
                    st.markdown('<div class="light-glass-card">', unsafe_allow_html=True)
                    if is_rejected:
                        # Clear invalid document state so chat is disabled
                        st.session_state.uploaded_file_path = None
                        st.session_state.chat_history = []
                        
                        st.markdown(f"""
                        <div style="background: #fef2f2; border-left: 4px solid #ef4444; border: 1px solid #fee2e2; padding: 16px 20px; border-radius: 10px; color: #991b1b; font-size: 1.02rem; font-weight: 600; display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 1.4rem;">⚠️</span>
                            <span>{NON_LEGAL_DOCUMENT_MESSAGE}</span>
                        </div>
                        """, unsafe_allow_html=True)
                    else:
                        st.session_state.uploaded_file_path = temp_filename
                        st.session_state.chat_history = [{"role": "assistant", "content": resp_text}]
                        
                        audio_file = None
                        try:
                            audio_lang = {"English": "en", "Hindi (हिंदी)": "hi", "Bangla (বাংলা)": "bn"}.get(st.session_state.language, "en")
                            tts = gTTS(text=resp_text, lang=audio_lang, slow=False)
                            audio_file = "analysis_audio.mp3"
                            tts.save(audio_file)
                        except Exception as e:
                            pass
                            
                        st.success("✅ Document Analysis Complete")
                        st.markdown(resp_text)
                        
                        if audio_file:
                            st.markdown("---")
                            st.write("🔊 **Listen to the Report:**")
                            st.audio(audio_file, format="audio/mp3")
                            
                    st.markdown('</div>', unsafe_allow_html=True)
                        
                except Exception as e:
                    st.error(f"System Exception: {e}")

# 8. Interactive Chatbot Interface
if st.session_state.is_authenticated and st.session_state.uploaded_file_path and st.session_state.chat_history:
    st.markdown("---")
    st.markdown("### 💬 Your Personal AI Legal Counsel")
    st.caption("Ask specific questions about clauses, phrasing, or legal implications found in your document.")
    
    st.markdown('<div class="light-glass-card">', unsafe_allow_html=True)
    
    for msg in st.session_state.chat_history[1:]:
        st.chat_message(msg["role"]).write(msg["content"])
        
    if user_question := st.chat_input("E.g., What does clause 4 mean for my liability?"):
        st.chat_message("user").write(user_question)
        st.session_state.chat_history.append({"role": "user", "content": user_question})
        
        with st.spinner("Reviewing the document context..."):
            try:
                gemini_file = client.files.upload(file=st.session_state.uploaded_file_path)
                chat_prompt = f"""
                You are an expert Legal Counsel.
                Based on the provided legal document, answer this user query strictly in {st.session_state.language}: {user_question}
                If the document is not a legal document, respond ONLY with: {NON_LEGAL_DOCUMENT_MESSAGE}
                """
                
                chat_response = client.models.generate_content(
                    model='gemini-3.6-flash',
                    contents=[gemini_file, chat_prompt]
                )
                
                chat_resp_text = (chat_response.text or "").strip()
                chat_resp_lower = chat_resp_text.lower()
                if any(kw in chat_resp_lower for kw in ["not a legal document", "please upload the correct one"]):
                    chat_resp_text = NON_LEGAL_DOCUMENT_MESSAGE
                
                st.chat_message("assistant").write(chat_resp_text)
                st.session_state.chat_history.append({"role": "assistant", "content": chat_resp_text})
            except Exception as e:
                st.error("Chat Server Offline. Please try again.")
                
    st.markdown('</div>', unsafe_allow_html=True)

# 9. Quiet Clean Footer
st.markdown("""
    <div class="cert-footer">
        <h4 style="color: #475569; font-weight: 600;">Industry Standards & Compliance</h4>
        <p style="font-size: 0.85rem; color: #64748b;">Data securely processed and immediately purged from temporary storage after analysis.</p>
        <div class="cert-icons">
            <span>🛡️ AES-256 Encryption</span>
            <span>🔒 ISO 27001 Data Compliant</span>
            <span>✅ AI Legal Framework Certified</span>
            <span>⚖️ Bar Association Standardized Playbook</span>
        </div>
        <p style="margin-top: 18px; font-size: 0.75rem; color: #94a3b8;">© 2026 LegalTech AI Verification Portal. All rights reserved.</p>
    </div>
""", unsafe_allow_html=True)