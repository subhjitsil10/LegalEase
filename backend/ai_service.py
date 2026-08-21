import os
import time
import base64
from io import BytesIO
from google import genai
from dotenv import load_dotenv
from gtts import gTTS
from playbook import LEGAL_PLAYBOOK, NON_LEGAL_DOCUMENT_MESSAGE

dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(dotenv_path)

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

def analyze_legal_document(file_bytes: bytes, filename: str, language: str = "English"):
    if not client:
        return {
            "success": False,
            "error": "Gemini API key is not configured in backend environment."
        }
        
    temp_dir = os.path.join(os.path.dirname(__file__), "temp_uploads")
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, f"temp_{int(time.time())}_{filename}")
    
    with open(temp_path, "wb") as f:
        f.write(file_bytes)
        
    try:
        gemini_file = client.files.upload(file=temp_path)
        
        prompt = f"""
        {LEGAL_PLAYBOOK}
        =========================================
        CRITICAL LANGUAGE INSTRUCTION:
        If and ONLY if the document is verified as an authentic legal document, translate the ENTIRE analysis and respond FLUENTLY in {language}.
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
        
        if is_rejected:
            # Clean up temp file
            if os.path.exists(temp_path):
                try: os.remove(temp_path)
                except Exception: pass
            return {
                "success": True,
                "is_legal": False,
                "report": NON_LEGAL_DOCUMENT_MESSAGE,
                "audio_url": None,
                "doc_temp_path": None
            }
            
        # Valid legal document -> Generate audio report
        audio_b64 = None
        try:
            lang_code_map = {"English": "en", "Hindi (हिंदी)": "hi", "Bangla (বাংলা)": "bn", "Hindi": "hi", "Bangla": "bn"}
            code = lang_code_map.get(language, "en")
            tts = gTTS(text=resp_text, lang=code, slow=False)
            fp = BytesIO()
            tts.write_to_fp(fp)
            fp.seek(0)
            audio_b64 = base64.b64encode(fp.getvalue()).decode('utf-8')
        except Exception as e:
            print(f"TTS Audio generation error: {e}")
            
        return {
            "success": True,
            "is_legal": True,
            "report": resp_text,
            "audio_url": f"data:audio/mp3;base64,{audio_b64}" if audio_b64 else None,
            "doc_temp_path": temp_path
        }
        
    except Exception as e:
        print(f"Gemini Analysis Error: {e}")
        return {
            "success": False,
            "error": str(e)
        }

def chat_with_legal_counsel(query: str, doc_temp_path: str = None, language: str = "English"):
    if not client:
        return {
            "success": False,
            "error": "Gemini API key is not configured in backend environment."
        }
        
    try:
        if doc_temp_path and os.path.exists(doc_temp_path):
            gemini_file = client.files.upload(file=doc_temp_path)
            chat_prompt = f"""
            You are an expert Legal Counsel.
            Based on the provided legal document and the centralized playbook:
            {LEGAL_PLAYBOOK}
            Answer this user query strictly in {language}: {query}
            If the document is not a legal document, respond ONLY with: {NON_LEGAL_DOCUMENT_MESSAGE}
            """
            contents = [gemini_file, chat_prompt]
        else:
            chat_prompt = f"""
            You are an expert Legal Counsel.
            Using standard legal playbook rules, corporate laws, employment statutes, and contract doctrines:
            {LEGAL_PLAYBOOK}
            Provide clear, structured, professional legal advice and guidance strictly in {language} for this query: {query}
            """
            contents = [chat_prompt]
            
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=contents
        )
        
        resp_text = (response.text or "").strip()
        resp_lower = resp_text.lower()
        if any(kw in resp_lower for kw in ["not a legal document", "please upload the correct one"]):
            resp_text = NON_LEGAL_DOCUMENT_MESSAGE
            
        return {
            "success": True,
            "response": resp_text
        }
    except Exception as e:
        print(f"Chat Counsel Error: {e}")
        return {
            "success": False,
            "error": str(e)
        }
