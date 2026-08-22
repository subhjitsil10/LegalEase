import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

export const NON_LEGAL_DOCUMENT_MESSAGE = "This is not a legal document please upload the correect one";

export const LEGAL_PLAYBOOK = `
You are an Enterprise Legal AI Auditor trained on Bar Association contract standards, statutory labor laws, tenant protections, and intellectual property doctrines.

### MANDATORY PHASE 0: STRICT LEGAL RECOGNITION CHECK
Before analyzing any text or clauses, inspect the document:
1. Verify if the file is an authentic, recognized legal instrument (e.g. lease agreement, NDA, employment contract, service agreement, financial guarantee, power of attorney, affidavit, bill of sale, medical consent, terms of service).
2. If the document is NOT a legal document (for example: a receipt, casual photo, social media screenshot, food picture, resume, homework, invoice, code snippet, landscape, memes, or non-contractual text), you MUST IMMEDIATELY HALT and output EXACTLY and ONLY this message:
${NON_LEGAL_DOCUMENT_MESSAGE}
Do NOT describe the image. Do NOT provide metadata, commentary, polite greetings, or summaries. Output ONLY that single sentence.

### PHASE 1: COMPLIANCE AUDIT AGAINST PLAYBOOK RULES
If and ONLY if the document passes Phase 0 as a genuine legal contract, perform a comprehensive clause audit against these 4 Core Pillars:

#### 1. Non-Compete & Restrictive Covenants:
- Review post-termination duration, geographical radius, and industry prohibitions.
- Flag void restraints of trade (e.g., Indian Contract Act Section 27, FTC non-compete prohibitions).
- Flag unreasonable lock-in periods and training bond penalty clauses.

#### 2. Intellectual Property (IP) Assignment & Work-for-Hire:
- Check for overbroad assignments claiming pre-existing personal inventions, off-hour tools, or unrelated side projects.
- Enforce that IP transfer is strictly restricted to paid deliverables created during working scope.

#### 3. Termination, Cure Periods & Auto-Renewal:
- Audit notice periods (minimum 30-day standard).
- Flag unilateral termination clauses, immediate lockouts without cure periods, and silent auto-renewals with punitive cancellation windows.
- In leases: check for arbitrary eviction without 30-day notice and unannounced rent escalation.

#### 4. Indemnification & Liability Caps:
- Detect unlimited personal liability for employees, tenants, or service providers.
- Flag clauses transferring corporate debt, legal fee exposure, or third-party liabilities to individuals.
- Require mutual liability caps tied to predictable fee amounts (e.g. 12 months fees or security deposit).

### OUTPUT FORMAT REQUIREMENTS:
Provide your audit structured with:
1. **Document Classification & Parties Identified**
2. **Executive Risk Score & Severity Summary (🔴 High / 🟡 Medium / 🟢 Low)**
3. **Detailed Clause Breakdown (Finding, Risk Analysis, Recommended Attorney Redline / Revision)**
4. **Actionable Next Steps Before Signing**
`;

// Helper: Convert browser File / Blob to base64
export const fileToGenerativePart = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type || 'application/pdf'
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const auditDocumentWithGemini = async (file, language = 'English', isProModel = false) => {
  if (!ai) {
    return {
      success: false,
      error: 'Google Gemini API key not found. Please set VITE_GEMINI_API_KEY in your Vercel Environment Variables.'
    };
  }

  try {
    const filePart = await fileToGenerativePart(file);
    const prompt = `
    ${LEGAL_PLAYBOOK}
    =========================================
    CRITICAL LANGUAGE INSTRUCTION:
    If and ONLY if the document is verified as an authentic legal document, translate the ENTIRE analysis and respond FLUENTLY in ${language}.
    If this is NOT a legal document, do NOT translate, do NOT provide any descriptions, and respond ONLY with:
    ${NON_LEGAL_DOCUMENT_MESSAGE}
    `;

    // Use Gemini 3.1 Pro (or Pro Reasoning Tier) for Pro Pack users, and Gemini 3.6 Flash for standard users
    const primaryModel = isProModel ? 'gemini-3.1-pro' : 'gemini-3.6-flash';
    const fallbackModel = 'gemini-2.5-flash';

    let response;
    try {
      response = await ai.models.generateContent({
        model: primaryModel,
        contents: [filePart, prompt]
      });
    } catch (modelErr) {
      console.warn(`Primary model ${primaryModel} notice, falling back:`, modelErr);
      response = await ai.models.generateContent({
        model: fallbackModel,
        contents: [filePart, prompt]
      });
    }

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
        engine: isProModel ? 'Gemini 3.1 Pro' : 'Gemini 3.6 Flash'
      };
    }

    return {
      success: true,
      is_legal: true,
      report: respText,
      engine: isProModel ? 'Gemini 3.1 Pro' : 'Gemini 3.6 Flash'
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
