export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, code } = req.body || {};
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' });
  }

  const resendApiKey = process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    return res.status(200).json({
      success: true,
      simulated: true,
      code,
      message: `Simulated OTP: ${code}`
    });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'LegalEase Security <onboarding@resend.dev>',
        to: [email],
        subject: 'Your Secure Verification Code • LegalEase',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #1e3a8a; margin: 0; font-size: 24px;">⚖️ LegalEase</h2>
              <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Enterprise Legal Intelligence Portal</p>
            </div>
            <p style="color: #334155; font-size: 15px; line-height: 1.5;">Hello,</p>
            <p style="color: #334155; font-size: 15px; line-height: 1.5;">Use the 4-digit verification code below to sign in to your LegalEase workspace:</p>
            <div style="text-align: center; margin: 24px 0;">
              <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #2563eb; background: #eff6ff; padding: 12px 28px; border-radius: 12px; border: 1px solid #bfdbfe;">
                ${code}
              </span>
            </div>
            <p style="color: #64748b; font-size: 13px; line-height: 1.5;">This verification code will expire in 10 minutes.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">© 2026 LegalEase Portal. All rights reserved.</p>
          </div>
        `
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(200).json({
        success: true,
        delivered: false,
        fallback_code: code,
        resend_error: data.message || 'Resend domain restriction',
        message: `Testing restriction: use code ${code}`
      });
    }

    return res.status(200).json({ success: true, delivered: true, id: data.id, code });
  } catch (err) {
    return res.status(200).json({
      success: true,
      delivered: false,
      fallback_code: code,
      error: err.message
    });
  }
}
