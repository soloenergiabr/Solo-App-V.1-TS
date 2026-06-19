import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // bytes
const AUTH_TAG_LENGTH = 16; // bytes
const KEY_LENGTH = 32; // bytes

/**
 * Derives a 32-byte encryption key from the given secret using SHA-256.
 */
function deriveKey(secret: string): Buffer {
    return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Returns the 32-byte AES-256-GCM encryption key.
 *
 * Priority:
 * 1. `process.env.APP_ENCRYPTION_KEY` (must be at least 32 chars, hashed to fit)
 * 2. A derived key from `process.env.JWT_SECRET` (dev fallback)
 */
function getEncryptionKey(): Buffer {
    const key = process.env.APP_ENCRYPTION_KEY || process.env.JWT_SECRET;
    if (!key) {
        throw new Error(
            'No encryption key available. Set APP_ENCRYPTION_KEY or JWT_SECRET in environment variables.'
        );
    }
    return deriveKey(key);
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 *
 * Returns a combined string in the format: `iv:authTag:ciphertext`
 * where all three parts are hex-encoded.
 *
 * A random 16-byte IV is generated for every encryption call,
 * ensuring that the same plaintext produces different ciphertexts.
 */
export function encrypt(plaintext: string): string {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${ciphertext}`;
}

/**
 * Decrypts a ciphertext string previously produced by `encrypt()`.
 *
 * Expects the format: `iv:authTag:ciphertext` (all hex-encoded).
 * Throws if the auth tag verification fails (tampered ciphertext)
 * or if the format is invalid.
 */
export function decrypt(ciphertext: string): string {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) {
        throw new Error('Invalid encrypted format. Expected iv:authTag:ciphertext');
    }

    const [ivHex, authTagHex, encrypted] = parts;

    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    if (iv.length !== IV_LENGTH) {
        throw new Error('Invalid IV length');
    }

    if (authTag.length !== AUTH_TAG_LENGTH) {
        throw new Error('Invalid auth tag length');
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

/**
 * Checks whether a string matches the encrypted format pattern: `hex:hex:hex`.
 *
 * This is a heuristic — it checks that the value contains exactly two colons
 * and all segments are valid hex strings of reasonable length.
 */
export function isEncrypted(value: string): boolean {
    if (typeof value !== 'string') return false;

    const parts = value.split(':');
    if (parts.length !== 3) return false;

    // Each part must be a valid hex string
    const hexRegex = /^[0-9a-fA-F]+$/;
    for (const part of parts) {
        if (!hexRegex.test(part)) return false;
    }

    // IV must be 32 hex chars (16 bytes), auth tag must be 32 hex chars (16 bytes)
    if (parts[0].length !== 32) return false;
    if (parts[1].length !== 32) return false;

    return true;
}
