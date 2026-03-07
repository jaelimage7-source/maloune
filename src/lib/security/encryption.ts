/**
 * MALOUNE Security Module
 * AES-256-GCM Encryption for client data
 * 
 * AES-256-GCM is the strongest symmetric encryption available:
 * - 256-bit key = 2^256 possible keys (brute force impossible)
 * - GCM mode = authenticated encryption (integrity + confidentiality)
 * - IV (Initialization Vector) unique per encryption
 * - Auth Tag = verifies data hasn't been tampered with
 */
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;          // 128-bit IV
const AUTH_TAG_LENGTH = 16;    // 128-bit auth tag
const SALT_LENGTH = 32;        // 256-bit salt
const KEY_LENGTH = 32;         // 256-bit key
const PBKDF2_ITERATIONS = 310000; // OWASP 2023 recommendation for SHA-256

// Get or generate encryption key
function getEncryptionKey(): Buffer {
  const keyB64 = process.env.MALOUNE_ENCRYPTION_KEY;
  if (keyB64) {
    return Buffer.from(keyB64, 'base64');
  }
  // Fallback: derive from a combination of env vars (not ideal but better than nothing)
  const secret = `${process.env.MYPOS_SID}-${process.env.MYPOS_WALLET}-maloune-secret`;
  return crypto.pbkdf2Sync(secret, 'maloune-salt-2026', PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');
}

/**
 * Encrypt data with AES-256-GCM
 * Format: salt(32) + iv(16) + authTag(16) + ciphertext
 * All base64 encoded for storage/transport
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);
  
  // Derive unique key per encryption using salt
  const derivedKey = crypto.pbkdf2Sync(key, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');
  
  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  
  let encrypted = cipher.update(plaintext, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();
  
  // Combine: salt + iv + authTag + ciphertext
  const combined = Buffer.concat([salt, iv, authTag, encrypted]);
  return combined.toString('base64');
}

/**
 * Decrypt data encrypted with AES-256-GCM
 */
export function decrypt(encryptedData: string): string {
  const key = getEncryptionKey();
  const combined = Buffer.from(encryptedData, 'base64');
  
  // Extract components
  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = combined.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
  
  // Derive same key
  const derivedKey = crypto.pbkdf2Sync(key, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString('utf8');
}

/**
 * Hash sensitive data (one-way, for comparisons)
 * Uses SHA-512 with salt
 */
export function hashData(data: string): string {
  const salt = crypto.randomBytes(32);
  const hash = crypto.pbkdf2Sync(data, salt, PBKDF2_ITERATIONS, 64, 'sha512');
  return `${salt.toString('base64')}:${hash.toString('base64')}`;
}

/**
 * Verify hashed data
 */
export function verifyHash(data: string, storedHash: string): boolean {
  const [saltB64, hashB64] = storedHash.split(':');
  const salt = Buffer.from(saltB64, 'base64');
  const hash = crypto.pbkdf2Sync(data, salt, PBKDF2_ITERATIONS, 64, 'sha512');
  return crypto.timingSafeEqual(hash, Buffer.from(hashB64, 'base64'));
}

/**
 * Encrypt order data for storage
 */
export function encryptOrderData(orderData: {
  orderId: string;
  items: { name: string; price: number; quantity: number }[];
  total: number;
  customerEmail?: string;
  customerIp?: string;
  timestamp: string;
}): string {
  return encrypt(JSON.stringify(orderData));
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length = 48): string {
  return crypto.randomBytes(length).toString('base64url');
}

/**
 * Mask sensitive data for logging (show only last 4 chars)
 */
export function maskSensitive(data: string): string {
  if (data.length <= 4) return '****';
  return '****' + data.slice(-4);
}
