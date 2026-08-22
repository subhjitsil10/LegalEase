export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, code } = req.body || {};
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code required' });
  }

  const apiKey = process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ success: true, simulated: true, code });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: 'LegalEase Security <onboarding@resend.dev>',
        to: [email],
        subject: 'Your 4-Digit Verification Code • LegalEase',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center;">
            <h2 style="color: #1e40af; margin-bottom: 8px;">⚖️ LegalEase</h2>
            <p style="color: #475569; font-size: 14px;">Your 4-digit security code for account verification:</p>
            <div style="margin: 24px 0;">
              <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #2563eb; background: #eff6ff; padding: 12px 24px; border-radius: 8px; border: 1px solid #bfdbfe;">
                ${code}
              </span>
            </div>
            <p style="color: #94a3b8; font-size: 12px;">This code will expire in 10 minutes.</p>
          </div>
        `
      })
    });

    const data = await response.json();
    return res.status(200).json({ success: response.ok, data, code });
  } catch (err) {
    return res.status(500).json({ error: err.message, code });
  }
}
