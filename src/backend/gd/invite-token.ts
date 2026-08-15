import { createHash, randomBytes } from 'crypto'
import type { PayerInviteStatus } from '@/shared/gd/types'

/** Convite de pagador vale por uma semana. */
export const INVITE_TTL_DAYS = 7

/**
 * Gera o par token/hash do convite. Somente o hash vai para o banco — o token
 * cru so existe dentro do link enviado por e-mail, entao vazar a tabela nao
 * permite aceitar convites de ninguem.
 */
export function generateInviteToken(): { token: string; tokenHash: string } {
    const token = randomBytes(32).toString('hex')
    return { token, tokenHash: hashInviteToken(token) }
}

export function hashInviteToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
}

export function computeInviteExpiry(now: Date = new Date()): Date {
    return new Date(now.getTime() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000)
}

export interface InviteUsability {
    usable: boolean
    reason?: string
}

/** Decide se um convite ainda pode ser aceito, com a mensagem pt-BR do porque nao. */
export function resolveInviteUsability(
    invite: { status: PayerInviteStatus; expiresAt: Date | string },
    now: Date = new Date(),
): InviteUsability {
    if (invite.status === 'accepted') {
        return { usable: false, reason: 'Este convite ja foi usado. Faca login com seu e-mail e senha.' }
    }

    if (invite.status === 'revoked') {
        return { usable: false, reason: 'Este convite foi cancelado pelo titular da conta.' }
    }

    const expiresAt = invite.expiresAt instanceof Date ? invite.expiresAt : new Date(invite.expiresAt)
    if (Number.isNaN(expiresAt.getTime()) || expiresAt < now) {
        return { usable: false, reason: 'Este convite expirou. Peca um novo convite ao titular.' }
    }

    return { usable: true }
}
