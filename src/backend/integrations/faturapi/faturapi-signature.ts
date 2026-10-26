import crypto from 'node:crypto';

// Faturapi-Signature: "t=<unix>,v1=<hex>"
// esperado = HMAC-SHA256(secret, `${t}.${corpoBruto}`) em hex, comparado em tempo constante.

export const FATURAPI_SIGNATURE_TOLERANCE_SECONDS = 5 * 60;

export type SignatureVerificationResult =
    | { ok: true }
    | { ok: false; reason: 'missing_header' | 'malformed_header' | 'timestamp_out_of_tolerance' | 'signature_mismatch' | 'missing_secret' };

export function computeFaturapiSignature(rawBody: string, timestamp: number | string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`, 'utf8').digest('hex');
}

function parseSignatureHeader(header: string): { timestamp: number; signatures: string[] } | null {
    let timestamp: number | null = null;
    const signatures: string[] = [];

    for (const part of header.split(',')) {
        const separator = part.indexOf('=');
        if (separator === -1) continue;
        const key = part.slice(0, separator).trim();
        const value = part.slice(separator + 1).trim();
        if (key === 't' && /^\d+$/.test(value)) timestamp = Number(value);
        // Pode haver mais de um v1 durante a rotacao do secret.
        if (key === 'v1' && /^[0-9a-f]+$/i.test(value)) signatures.push(value.toLowerCase());
    }

    if (timestamp === null || signatures.length === 0) return null;
    return { timestamp, signatures };
}

export function verifyFaturapiSignature(
    rawBody: string,
    header: string | null | undefined,
    secret: string | undefined,
    nowMs: number = Date.now(),
): SignatureVerificationResult {
    if (!secret) return { ok: false, reason: 'missing_secret' };
    if (!header) return { ok: false, reason: 'missing_header' };

    const parsed = parseSignatureHeader(header);
    if (!parsed) return { ok: false, reason: 'malformed_header' };

    const nowSeconds = Math.floor(nowMs / 1000);
    if (Math.abs(nowSeconds - parsed.timestamp) > FATURAPI_SIGNATURE_TOLERANCE_SECONDS) {
        return { ok: false, reason: 'timestamp_out_of_tolerance' };
    }

    const expected = Buffer.from(computeFaturapiSignature(rawBody, parsed.timestamp, secret), 'hex');
    const matches = parsed.signatures.some((signature) => {
        const received = Buffer.from(signature, 'hex');
        return received.length === expected.length && crypto.timingSafeEqual(received, expected);
    });

    return matches ? { ok: true } : { ok: false, reason: 'signature_mismatch' };
}
