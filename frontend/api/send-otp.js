import nodemailer from 'nodemailer';

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
    return res.status(400).json({ error: 'Email and code are required' });
  }

  const cleanEmail = email.toLowerCase().trim();

  // 1. Direct High-Speed Gmail SMTP (Sends real 4-digit numeric code to ANY public recipient on Earth)
  const gmailUser = (process.env.GMAIL_USER || 'subhajitplugin10@gmail.com').replace(/\s+/g, '');
  const gmailPass = (process.env.GMAIL_APP_PASSWORD || 'yztj pzgn uxps fhxl').replace(/\s+/g, '');

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
      messageId: info.messageId,
      recipient: cleanEmail
    });
  } catch (err) {
    console.error('SMTP error:', err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
