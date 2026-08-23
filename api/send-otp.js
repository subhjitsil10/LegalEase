import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, code } = req.body || {};
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' });
  }

  const cleanEmail = email.toLowerCase().trim();

  // 1. Try Gmail SMTP if credentials configured
  const gmailUser = (process.env.GMAIL_USER || process.env.VITE_GMAIL_USER || 'subhajitplugin10@gmail.com').replace(/\s+/g, '');
  const gmailPass = (process.env.GMAIL_APP_PASSWORD || process.env.VITE_GMAIL_APP_PASSWORD || 'yztjpzgnuxpsfhxl').replace(/\s+/g, '');

  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass
        }
      });

      const info = await transporter.sendMail({
        from: `"LegalEase Security" <${gmailUser}>`,
        to: cleanEmail,
        subject: `Your Verification Code: ${code} • LegalEase`,
        text: `Your LegalEase 4-digit verification code is: ${code}. Valid for 10 minutes.`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #1e40af; margin: 0; font-size: 24px; font-weight: 800;">⚖️ LegalEase</h2>
              <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Enterprise Legal Intelligence Portal</p>
            </div>
            <p style="color: #334155; font-size: 15px; line-height: 1.5; margin-bottom: 12px;">Hello,</p>
            <p style="color: #334155; font-size: 15px; line-height: 1.5;">Use the 4-digit verification code below to sign in or create your LegalEase account:</p>
            <div style="text-align: center; margin: 28px 0;">
              <span style="display: inline-block; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #1d4ed8; background: #eff6ff; padding: 14px 32px; border-radius: 12px; border: 2px solid #bfdbfe;">
                ${code}
              </span>
            </div>
            <p style="color: #64748b; font-size: 13px; line-height: 1.5;">This one-time security code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">© 2026 LegalEase • AI Contract Compliance Intelligence</p>
          </div>
        `
      });

      return res.status(200).json({
        success: true,
        delivered: true,
        provider: 'gmail_smtp',
        messageId: info.messageId,
        code
      });
    } catch (smtpErr) {
      console.warn('Gmail SMTP error:', smtpErr.message);
    }
  }

  // 2. Fallback to Resend API if configured
  const resendApiKey = process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: 'LegalEase Security <onboarding@resend.dev>',
          to: [cleanEmail],
          subject: `Your Verification Code: ${code} • LegalEase`,
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
      if (response.ok) {
        return res.status(200).json({ success: true, delivered: true, provider: 'resend', id: data.id, code });
      }
    } catch (resendErr) {
      console.warn('Resend error:', resendErr.message);
    }
  }

  // 3. Fallback if no email provider credentials configured
  return res.status(200).json({
    success: true,
    delivered: false,
    simulated: true,
    code,
    message: `Development OTP: ${code}`
  });
}
