const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || '';

export const sendOtpWithResend = async (toEmail, otpCode) => {
  // Try serverless endpoint first (Zero CORS)
  try {
    const res = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: toEmail, code: otpCode })
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        delivered: data.delivered,
        code: data.fallback_code || otpCode,
        notice: data.resend_error
      };
    }
  } catch (err) {
    console.log('Serverless dispatch fallback:', err);
  }

  // Direct client attempt if Resend key is present
  if (RESEND_API_KEY) {
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
          html: `<p>Your LegalEase code is: <strong>${otpCode}</strong></p>`
        })
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, delivered: true, code: otpCode };
      }
    } catch (e) {
      console.log('Direct Resend fetch:', e);
    }
  }

  // Always return success with code so user is never blocked
  return { success: true, delivered: false, code: otpCode };
};
