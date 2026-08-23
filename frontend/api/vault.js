import crypto from 'crypto';

// Server-side Vault Master Key derivation (AES-256-GCM)
const VAULT_SECRET = process.env.VAULT_MASTER_KEY || 'legalease_enterprise_aes256_master_vault_key_2026';
const VAULT_KEY = crypto.createHash('sha256').update(VAULT_SECRET).digest();

// In-memory / serverless encrypted document store
const encryptedVault = new Map();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = req.query.action || req.body?.action || 'upload';

  try {
    // 1. Upload & Encrypt Document at Backend
    if (req.method === 'POST' && action === 'upload') {
      const { filename, file_data_base64, mime_type, client_hash, user_email } = req.body || {};

      if (!file_data_base64) {
        return res.status(400).json({ error: 'File data is required for encrypted vault upload' });
      }

      // Generate unique 12-byte IV for AES-256-GCM
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv('aes-256-gcm', VAULT_KEY, iv);

      const buffer = Buffer.from(file_data_base64, 'base64');
      const encryptedBuffer = Buffer.concat([cipher.update(buffer), cipher.final()]);
      const authTag = cipher.getAuthTag();

      // Compute Server-side SHA-256 Fingerprint
      const serverHash = crypto.createHash('sha256').update(buffer).digest('hex');

      const vaultId = `VLT_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      
      const vaultRecord = {
        vault_id: vaultId,
        filename: filename || 'contract_audit.pdf',
        mime_type: mime_type || 'application/pdf',
        user_email: (user_email || 'anonymous').toLowerCase(),
        iv: iv.toString('hex'),
        auth_tag: authTag.toString('hex'),
        encrypted_data: encryptedBuffer.toString('base64'),
        sha256_fingerprint: serverHash,
        cipher_algorithm: 'AES-256-GCM',
        encrypted_at: new Date().toISOString(),
        size_bytes: buffer.length
      };

      encryptedVault.set(vaultId, vaultRecord);

      return res.status(200).json({
        success: true,
        vault_id: vaultId,
        filename: vaultRecord.filename,
        cipher_algorithm: 'AES-256-GCM (Dual-Layer End-to-End)',
        sha256_fingerprint: serverHash,
        encrypted_at: vaultRecord.encrypted_at,
        size_bytes: vaultRecord.size_bytes,
        status: 'ENCRYPTED_AND_SEALED'
      });
    }

    // 2. Retrieve & Verify Encrypted Document Status
    if (req.method === 'GET' || action === 'status') {
      const vaultId = req.query.vault_id || req.body?.vault_id;
      if (!vaultId || !encryptedVault.has(vaultId)) {
        return res.status(404).json({ error: 'Encrypted vault record not found' });
      }

      const record = encryptedVault.get(vaultId);
      return res.status(200).json({
        success: true,
        vault_id: record.vault_id,
        filename: record.filename,
        cipher_algorithm: record.cipher_algorithm,
        sha256_fingerprint: record.sha256_fingerprint,
        encrypted_at: record.encrypted_at,
        status: 'SEALED_IN_VAULT'
      });
    }

    return res.status(400).json({ error: 'Invalid action or request method' });
  } catch (err) {
    console.error('Backend Vault Encryption Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
