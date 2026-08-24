import { GoogleGenAI } from '@google/genai';
import mammoth from 'mammoth';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

export const NON_LEGAL_DOCUMENT_MESSAGE = "This is not a legal document please upload the correect one";

export const LEGAL_PLAYBOOK = `
You are an Elite Enterprise Legal Counsel & Contract Risk Auditor.

### MANDATORY PHASE 0: STRICT LEGAL RECOGNITION CHECK
1. Check if the uploaded file is an authentic legal instrument (e.g. employment agreement, NDA, residential lease, commercial contract, service terms, power of attorney, affidavit).
2. If NOT a genuine legal document (e.g. food photos, homework, receipts, landscape, random code, memes), STOP IMMEDIATELY and reply ONLY with:
${NON_LEGAL_DOCUMENT_MESSAGE}

### PHASE 1: CRISP, HIGH-IMPACT PLAYBOOK AUDIT (HIGHLIGHT RED FLAGS FIRST)
If verified, provide a clean, executive, brief audit.
CRITICAL FORMATTING RULES:
- Highlight TOP RED FLAGS FIRST with clear Risk Levels.
- Keep explanations brief, punchy, and jargon-free (under 400 words total).
- Do NOT use ascii divider lines (like ===, ---, ### lines), markdown table clutter, or excessive symbols.

Structure your response clearly with these 4 headings:

## 🚨 CRITICAL RED FLAGS & RISK LEVELS (HIGHLIGHTED FIRST)
For each dangerous clause or trap found in the document, list:
- [🔴 HIGH RISK] or [🟡 MEDIUM RISK] or [🟢 LOW RISK]: [Name of Clause]
  • Issue: [1 brief sentence explaining the unfair clause or hidden trap]
  • Signer Impact: [Direct financial, career, or legal penalty to the signer]

## 📊 EXECUTIVE SUMMARY & COMPLIANCE SCORE
- Document Type: [e.g. Employment Contract / Residential Lease / NDA]
- Overall Health Score: [e.g. 65/100 • Moderate Risk Detected]
- Executive Verdict: [2 crisp sentences summarizing overall safety]

## 🛡️ 4-PILLAR PLAYBOOK CHECK
- Non-Compete & Restraint of Trade: [Pass / Flagged - 1 brief sentence]
- IP Assignment Scope: [Pass / Flagged - 1 brief sentence]
- Termination & Notice Cure Periods: [Pass / Flagged - 1 brief sentence]
- Indemnification & Liability Caps: [Pass / Flagged - 1 brief sentence]

## 📝 ACTIONABLE NEXT STEPS BEFORE SIGNING
1. [Key item to negotiate or strike out]
2. [Documentary proof or clarification to request in writing]
3. [Safety condition before signing]
`;

export const getMimeType = (file) => {
  if (file.type && file.type !== 'application/octet-stream') {
    return file.type;
  }
  const name = (file.name || '').toLowerCase();
  if (name.endsWith('.pdf')) return 'application/pdf';
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
  if (name.endsWith('.webp')) return 'image/webp';
  if (name.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  return 'image/jpeg';
};

// Helper: Convert browser File / Blob to base64
export const fileToGenerativePart = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result ? reader.result.split(',')[1] : '';
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: getMimeType(file)
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const prepareContentPayload = async (file, prompt) => {
  const fileName = (file.name || '').toLowerCase();

  // 1. If DOCX file, extract text via mammoth for 100% reliable Gemini processing
  if (fileName.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const docxText = (result?.value || '').trim();
      if (docxText) {
        return [
          {
            text: `DOCUMENT CONTENT (Extracted from ${file.name}):\n\n${docxText}\n\n=========================================\n${prompt}`
          }
        ];
      }
    } catch (docxErr) {
      console.warn('DOCX mammoth extraction fallback:', docxErr);
    }
  }

  // 2. If Plain Text / Markdown / CSV
  if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.csv') || (file.type && file.type.startsWith('text/'))) {
    try {
      const text = await file.text();
      return [
        {
          text: `DOCUMENT CONTENT (from ${file.name}):\n\n${text}\n\n=========================================\n${prompt}`
        }
      ];
    } catch (txtErr) {
      console.warn('Text file read error:', txtErr);
    }
  }

  // 3. For PDF and Image files (PNG, JPG, WEBP)
  const filePart = await fileToGenerativePart(file);
  return [filePart, prompt];
};

export const auditDocumentWithGemini = async (file, language = 'English', isProModel = false) => {
  if (!ai) {
    return {
      success: false,
      error: 'Google Gemini API key not found. Please set VITE_GEMINI_API_KEY in your Vercel Environment Variables.'
    };
  }

  try {
    const contents = await prepareContentPayload(file, `
    ${LEGAL_PLAYBOOK}
    =========================================
    CRITICAL LANGUAGE INSTRUCTION:
    If and ONLY if the document is verified as an authentic legal document, respond entirely and fluently in ${language} (including authentic Tamil if Tamil is chosen, or Hindi, Bangla, English).
    If this is NOT a legal document, do NOT translate, do NOT provide any descriptions, and respond ONLY with:
    ${NON_LEGAL_DOCUMENT_MESSAGE}
    `);

    // Standard & Pro audits powered by Gemini 3.6 Flash
    const modelToUse = 'gemini-3.6-flash';

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents
    });

    const respText = (response.text || '').trim();
    const respLower = respText.toLowerCase();

    // Strict validation check for non-legal documents
    const rejectionKeywords = [
      'not a legal document',
      'not a legal contract',
      'not a recognized legal document',
      'please upload the correct one',
      'please upload the correect one'
    ];

    const isRejected = rejectionKeywords.some(kw => respLower.includes(kw)) || (respLower === NON_LEGAL_DOCUMENT_MESSAGE.toLowerCase());

    if (isRejected) {
      return {
        success: true,
        is_legal: false,
        report: NON_LEGAL_DOCUMENT_MESSAGE,
        engine: 'Gemini 3.6 Flash'
      };
    }

    return {
      success: true,
      is_legal: true,
      report: respText,
      engine: 'Gemini 3.6 Flash'
    };
  } catch (err) {
    console.error('Gemini Audit Error:', err);
    return {
      success: false,
      error: `Gemini AI Engine processing error: ${err.message}`
    };
  }
};

export const chatWithLegalCounsel = async (userMessage, documentContext = '', language = 'English') => {
  if (!ai) {
    return {
      success: false,
      error: 'Google Gemini API key not configured.'
    };
  }

  try {
    const prompt = `
    You are LegalEase AI Counsel — an elite legal risk advisor.
    The user is asking questions about their uploaded agreement.
    
    DOCUMENT AUDIT CONTEXT:
    ${documentContext ? documentContext.substring(0, 5000) : 'No document currently uploaded. Answer general contract law questions.'}

    USER QUESTION:
    ${userMessage}

    CRITICAL INSTRUCTIONS:
    - Respond concisely with high legal accuracy and tactical advice.
    - Provide precise revision wording / redlines where applicable.
    - Fluently reply in ${language}.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [prompt]
    });

    return {
      success: true,
      reply: response.text
    };
  } catch (err) {
    console.error('Chat Error:', err);
    return {
      success: false,
      error: 'Failed to consult Legal Counsel. Please try again.'
    };
  }
};
