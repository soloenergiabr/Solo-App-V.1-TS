import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, isEncrypted } from '@/backend/crypto/encryption';

// Ensure APP_ENCRYPTION_KEY is set for tests
process.env.APP_ENCRYPTION_KEY = 'dev-encryption-key-change-in-production-min-32-chars';

describe('encryption module', () => {
    describe('encrypt / decrypt round-trip', () => {
        it('should encrypt and decrypt a simple string', () => {
            const original = 'hello world';
            const encrypted = encrypt(original);
            const decrypted = decrypt(encrypted);
            expect(decrypted).toBe(original);
        });

        it('should encrypt and decrypt an empty string', () => {
            const original = '';
            const encrypted = encrypt(original);
            const decrypted = decrypt(encrypted);
            expect(decrypted).toBe(original);
        });

        it('should encrypt and decrypt a long string', () => {
            const original = 'a'.repeat(10000);
            const encrypted = encrypt(original);
            const decrypted = decrypt(encrypted);
            expect(decrypted).toBe(original);
        });

        it('should encrypt and decrypt special characters and unicode', () => {
            const original = 'Hello, Mundo! ~!@#$%^&*()_+ 你好 🌍';
            const encrypted = encrypt(original);
            const decrypted = decrypt(encrypted);
            expect(decrypted).toBe(original);
        });

        it('should encrypt and decrypt an API key-like string', () => {
            const original = 'sk-test-fake-api-key-for-unit-tests-only-0123456789';
            const encrypted = encrypt(original);
            const decrypted = decrypt(encrypted);
            expect(decrypted).toBe(original);
        });
    });

    describe('decrypt error handling', () => {
        it('should throw on tampered ciphertext', () => {
            const original = 'sensitive data';
            const encrypted = encrypt(original);

            // Tamper with the ciphertext portion (third part)
            const parts = encrypted.split(':');
            const tampered = `${parts[0]}:${parts[1]}:deadbeef${parts[2].slice(8)}`;

            expect(() => decrypt(tampered)).toThrow();
        });

        it('should throw on tampered auth tag', () => {
            const original = 'sensitive data';
            const encrypted = encrypt(original);

            // Tamper with the auth tag (second part)
            const parts = encrypted.split(':');
            const tampered = `${parts[0]}:deadbeefdeadbeefdeadbeefdeadbeef:${parts[2]}`;

            expect(() => decrypt(tampered)).toThrow();
        });

        it('should throw on tampered IV', () => {
            const original = 'sensitive data';
            const encrypted = encrypt(original);

            // Tamper with the IV (first part)
            const parts = encrypted.split(':');
            const tampered = `deadbeefdeadbeefdeadbeefdeadbeef:${parts[1]}:${parts[2]}`;

            expect(() => decrypt(tampered)).toThrow();
        });

        it('should throw on malformed input (no colons)', () => {
            expect(() => decrypt('just-a-plain-string')).toThrow(
                'Invalid encrypted format'
            );
        });

        it('should throw on malformed input (too many parts)', () => {
            expect(() => decrypt('aa:bb:cc:dd')).toThrow(
                'Invalid encrypted format'
            );
        });

        it('should throw on empty string', () => {
            expect(() => decrypt('')).toThrow('Invalid encrypted format');
        });

        it('should throw on invalid hex in IV', () => {
            expect(() => decrypt('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz:abc123:def456')).toThrow();
        });
    });

    describe('isEncrypted', () => {
        it('should return true for a valid encrypted string', () => {
            const encrypted = encrypt('test');
            expect(isEncrypted(encrypted)).toBe(true);
        });

        it('should return false for a plaintext string', () => {
            expect(isEncrypted('hello world')).toBe(false);
        });

        it('should return false for an empty string', () => {
            expect(isEncrypted('')).toBe(false);
        });

        it('should return false for a string with wrong number of parts', () => {
            expect(isEncrypted('aa:bb')).toBe(false);
            expect(isEncrypted('aa:bb:cc:dd')).toBe(false);
        });

        it('should return false for a string with non-hex parts', () => {
            expect(isEncrypted('hello:world:test')).toBe(false);
        });

        it('should return false for an encrypted string with wrong IV length', () => {
            // IV should be 32 hex chars, use 16 instead
            const value = 'abcdef0123456789:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
            expect(isEncrypted(value)).toBe(false);
        });

        it('should return false for a number', () => {
            expect(isEncrypted(42 as unknown as string)).toBe(false);
        });

        it('should return false for null', () => {
            expect(isEncrypted(null as unknown as string)).toBe(false);
        });

        it('should return false for undefined', () => {
            expect(isEncrypted(undefined as unknown as string)).toBe(false);
        });
    });

    describe('IV uniqueness', () => {
        it('should produce different ciphertexts for the same input (different IVs)', () => {
            const input = 'same input';
            const result1 = encrypt(input);
            const result2 = encrypt(input);

            // Decrypt both and verify
            expect(decrypt(result1)).toBe(input);
            expect(decrypt(result2)).toBe(input);

            // The encrypted values should be different (different IVs)
            expect(result1).not.toBe(result2);

            // Extract IVs — they should differ
            const iv1 = result1.split(':')[0];
            const iv2 = result2.split(':')[0];
            expect(iv1).not.toBe(iv2);
        });
    });

    describe('key derivation', () => {
        it('should use APP_ENCRYPTION_KEY when set', () => {
            // This is already set globally — verify round-trip works
            const result = encrypt('test with key');
            expect(decrypt(result)).toBe('test with key');
        });
    });
});
