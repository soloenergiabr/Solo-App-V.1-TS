import crypto from 'node:crypto'
import { describe, it, expect } from 'vitest'
import {
    computeFaturapiSignature,
    verifyFaturapiSignature,
    FATURAPI_SIGNATURE_TOLERANCE_SECONDS,
} from '../faturapi-signature'

const SECRET = 'whsec_test_secret'
const BODY = JSON.stringify({ id: 'evt_1', type: 'invoice.received', createdAt: '2026-10-25T12:00:00Z', data: {} })
const NOW_MS = 1_793_000_000_000
const NOW_S = Math.floor(NOW_MS / 1000)

function header(timestamp: number, signature: string) {
    return `t=${timestamp},v1=${signature}`
}

function sign(body = BODY, timestamp = NOW_S, secret = SECRET) {
    return header(timestamp, computeFaturapiSignature(body, timestamp, secret))
}

describe('computeFaturapiSignature', () => {
    it('e o HMAC-SHA256 hex de `${t}.${corpo}`', () => {
        const expected = crypto.createHmac('sha256', SECRET).update(`${NOW_S}.${BODY}`).digest('hex')
        expect(computeFaturapiSignature(BODY, NOW_S, SECRET)).toBe(expected)
    })
})

describe('verifyFaturapiSignature', () => {
    it('aceita assinatura valida', () => {
        expect(verifyFaturapiSignature(BODY, sign(), SECRET, NOW_MS)).toEqual({ ok: true })
    })

    it('aceita header com espacos e v1 em maiusculas', () => {
        const sig = computeFaturapiSignature(BODY, NOW_S, SECRET).toUpperCase()
        expect(verifyFaturapiSignature(BODY, `t=${NOW_S}, v1=${sig}`, SECRET, NOW_MS)).toEqual({ ok: true })
    })

    it('aceita quando qualquer um dos v1 confere (rotacao de secret)', () => {
        const valid = computeFaturapiSignature(BODY, NOW_S, SECRET)
        const stale = computeFaturapiSignature(BODY, NOW_S, 'old_secret')
        expect(verifyFaturapiSignature(BODY, `t=${NOW_S},v1=${stale},v1=${valid}`, SECRET, NOW_MS)).toEqual({ ok: true })
    })

    it('rejeita corpo alterado', () => {
        const tampered = BODY.replace('invoice.received', 'unit.overdue')
        expect(verifyFaturapiSignature(tampered, sign(), SECRET, NOW_MS)).toEqual({ ok: false, reason: 'signature_mismatch' })
    })

    it('rejeita corpo re-serializado (assinatura vale para o corpo bruto)', () => {
        const reserialized = JSON.stringify(JSON.parse(BODY), null, 2)
        expect(verifyFaturapiSignature(reserialized, sign(), SECRET, NOW_MS)).toEqual({ ok: false, reason: 'signature_mismatch' })
    })

    it('rejeita secret errado', () => {
        expect(verifyFaturapiSignature(BODY, sign(BODY, NOW_S, 'wrong'), SECRET, NOW_MS)).toEqual({ ok: false, reason: 'signature_mismatch' })
    })

    it('rejeita timestamp trocado mantendo a assinatura original', () => {
        const sig = computeFaturapiSignature(BODY, NOW_S, SECRET)
        expect(verifyFaturapiSignature(BODY, header(NOW_S - 1, sig), SECRET, NOW_MS)).toEqual({ ok: false, reason: 'signature_mismatch' })
    })

    it('aceita no limite da tolerancia de 5 minutos', () => {
        const t = NOW_S - FATURAPI_SIGNATURE_TOLERANCE_SECONDS
        expect(verifyFaturapiSignature(BODY, sign(BODY, t), SECRET, NOW_MS)).toEqual({ ok: true })
    })

    it('rejeita timestamp antigo demais', () => {
        const t = NOW_S - FATURAPI_SIGNATURE_TOLERANCE_SECONDS - 1
        expect(verifyFaturapiSignature(BODY, sign(BODY, t), SECRET, NOW_MS)).toEqual({ ok: false, reason: 'timestamp_out_of_tolerance' })
    })

    it('rejeita timestamp no futuro alem da tolerancia', () => {
        const t = NOW_S + FATURAPI_SIGNATURE_TOLERANCE_SECONDS + 1
        expect(verifyFaturapiSignature(BODY, sign(BODY, t), SECRET, NOW_MS)).toEqual({ ok: false, reason: 'timestamp_out_of_tolerance' })
    })

    it('rejeita v1 com tamanho diferente sem lancar erro', () => {
        expect(verifyFaturapiSignature(BODY, header(NOW_S, 'abcd'), SECRET, NOW_MS)).toEqual({ ok: false, reason: 'signature_mismatch' })
    })

    it.each([
        ['sem v1', `t=${NOW_S}`],
        ['sem t', 'v1=abcdef'],
        ['t nao numerico', 't=abc,v1=abcdef'],
        ['v1 nao hex', `t=${NOW_S},v1=zzzz`],
        ['assinatura crua sem prefixos', computeFaturapiSignature(BODY, NOW_S, SECRET)],
    ])('rejeita header malformado (%s)', (_, value) => {
        expect(verifyFaturapiSignature(BODY, value, SECRET, NOW_MS)).toEqual({ ok: false, reason: 'malformed_header' })
    })

    it('rejeita header ausente', () => {
        expect(verifyFaturapiSignature(BODY, null, SECRET, NOW_MS)).toEqual({ ok: false, reason: 'missing_header' })
    })

    it('rejeita quando FATURAPI_WEBHOOK_SECRET nao esta configurado', () => {
        expect(verifyFaturapiSignature(BODY, sign(), undefined, NOW_MS)).toEqual({ ok: false, reason: 'missing_secret' })
        expect(verifyFaturapiSignature(BODY, sign(), '', NOW_MS)).toEqual({ ok: false, reason: 'missing_secret' })
    })
})
