import { describe, expect, it } from 'vitest'
import {
    INVITE_TTL_DAYS,
    computeInviteExpiry,
    generateInviteToken,
    hashInviteToken,
    resolveInviteUsability,
} from './invite-token'

describe('generateInviteToken', () => {
    it('devolve o token cru e o hash correspondente', () => {
        const { token, tokenHash } = generateInviteToken()

        expect(token).toMatch(/^[0-9a-f]{64}$/)
        expect(tokenHash).toBe(hashInviteToken(token))
    })

    it('nunca repete o token entre convites', () => {
        const tokens = new Set(Array.from({ length: 50 }, () => generateInviteToken().token))

        expect(tokens.size).toBe(50)
    })

    it('nao guarda o token cru dentro do hash', () => {
        const { token, tokenHash } = generateInviteToken()

        expect(tokenHash).not.toBe(token)
        expect(tokenHash).toMatch(/^[0-9a-f]{64}$/)
    })
})

describe('hashInviteToken', () => {
    it('e deterministico', () => {
        expect(hashInviteToken('abc')).toBe(hashInviteToken('abc'))
    })

    it('muda com o token', () => {
        expect(hashInviteToken('abc')).not.toBe(hashInviteToken('abd'))
    })
})

describe('computeInviteExpiry', () => {
    it('expira em INVITE_TTL_DAYS a partir de agora', () => {
        const now = new Date('2026-08-14T10:00:00.000Z')
        const expiry = computeInviteExpiry(now)

        const expected = new Date(now.getTime() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000)
        expect(expiry.toISOString()).toBe(expected.toISOString())
    })
})

describe('resolveInviteUsability', () => {
    const now = new Date('2026-08-14T10:00:00.000Z')
    const future = new Date('2026-08-20T10:00:00.000Z')
    const past = new Date('2026-08-01T10:00:00.000Z')

    it('aceita convite pendente dentro do prazo', () => {
        expect(resolveInviteUsability({ status: 'pending', expiresAt: future }, now)).toEqual({
            usable: true,
        })
    })

    it('recusa convite expirado', () => {
        const result = resolveInviteUsability({ status: 'pending', expiresAt: past }, now)

        expect(result.usable).toBe(false)
        expect(result.reason).toMatch(/expirou/i)
    })

    it('recusa convite ja aceito', () => {
        const result = resolveInviteUsability({ status: 'accepted', expiresAt: future }, now)

        expect(result.usable).toBe(false)
        expect(result.reason).toMatch(/ja foi usado/i)
    })

    it('recusa convite revogado', () => {
        const result = resolveInviteUsability({ status: 'revoked', expiresAt: future }, now)

        expect(result.usable).toBe(false)
        expect(result.reason).toMatch(/cancelado/i)
    })
})
