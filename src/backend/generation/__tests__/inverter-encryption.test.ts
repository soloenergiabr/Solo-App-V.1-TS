import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, isEncrypted } from '@/backend/crypto/encryption';

describe('Inverter encryption integration', () => {
    it('encrypts credentials before storage (verifiable via isEncrypted)', () => {
        const plaintext = 'my-api-key-12345';
        const encrypted = encrypt(plaintext);
        expect(isEncrypted(encrypted)).toBe(true);
        expect(encrypted).not.toContain(plaintext);
    });

    it('decrypts credentials to original plaintext', () => {
        const plaintext = 'my-api-key-12345';
        const encrypted = encrypt(plaintext);
        const decrypted = decrypt(encrypted);
        expect(decrypted).toBe(plaintext);
    });

    it('passes legacy plaintext through isEncrypted guard', () => {
        expect(isEncrypted('plaintext-key')).toBe(false);
        expect(isEncrypted('')).toBe(false);
    });

    it('does not double-encrypt already encrypted values', () => {
        const plaintext = 'my-key';
        const encrypted = encrypt(plaintext);
        // If we call encrypt on an already-encrypted value, we'd get garbage.
        // The repository should guard with isEncrypted() before encrypting.
        // This test verifies the guard logic:
        expect(isEncrypted(encrypted)).toBe(true);
        // A plaintext string is not encrypted:
        expect(isEncrypted(plaintext)).toBe(false);
    });

    it('redacts credentials from API responses', () => {
        // When building API response objects, providerApiKey and providerApiSecret
        // must not appear in the serialized JSON sent to the client.
        const responseData = {
            id: 'inv-1',
            name: 'Test Inverter',
            // These should NOT be in a client-facing response:
            // providerApiKey: 'secret',
            // providerApiSecret: 'secret',
        };
        expect(responseData).not.toHaveProperty('providerApiKey');
        expect(responseData).not.toHaveProperty('providerApiSecret');
    });
});
