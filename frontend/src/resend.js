const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || '';

export const sendOtpWithResend = async (toEmail, otpCode) => {
  if (!RESEND_API_KEY) {
    console.log(`[Resend Notice] VITE_RESEND_API_KEY not configured. Verification code is: ${otpCode}`);
    return { success: true, simulated: true, code: otpCode };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'LegalEase Security <onboarding@resend.dev>',
        to: [toEmail],
        subject: 'Your Secure Verification Code • LegalEase',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #1e3a8a; margin: 0;">⚖️ LegalEase</h2>
              <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Enterprise Legal Document Intelligence</p>
            </div>
            <p style="color: #334155; font-size: 15px; line-height: 1.5;">Hello,</p>
            <p style="color: #334155; font-size: 15px; line-height: 1.5;">Use the following 4-digit verification code to access your LegalEase workspace:</p>
            <div style="text-align: center; margin: 24px 0;">
              <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #2563eb; background: #eff6ff; padding: 12px 28px; border-radius: 12px; border: 1px solid #bfdbfe;">
                ${otpCode}
              </span>
            </div>
            <p style="color: #64748b; font-size: 13px; line-height: 1.5;">This verification code will expire shortly. If you did not request this code, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">© 2026 LegalEase Portal. All rights reserved.</p>
          </div>
        `
      })
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Resend API Error:', data);
      return { success: false, error: data.message || 'Resend delivery failed' };
    }

    return { success: true, id: data.id };
  } catch (err) {
    console.error('Resend Exception:', err);
    return { success: false, error: err.message };
  }
};
