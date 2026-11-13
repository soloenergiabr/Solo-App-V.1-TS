import { Prisma } from '@/app/generated/prisma'
import prisma from '@/lib/prisma'
import { sendMail } from '@/lib/mail'
import { config } from '@/config'
import { shell } from '@/backend/gd/emails'

export type NotificationType =
    | 'bill_available'
    | 'bill_due'
    | 'payment_confirmed'
    | 'savings_milestone'
    | 'no_generation'
    | 'reading_problem'
    | 'admin_alert'

export interface NotifyInput {
    /** null = alerta para os admins (ADMIN_ALERT_EMAIL), sem aparecer no app do cliente. */
    clientId: string | null
    type: NotificationType
    title: string
    body: string
    /** Caminho relativo do app (ex.: /economia/<id>); nos e-mails vira URL absoluta. */
    link?: string
    /** Chave unica: a mesma chave nunca e enviada duas vezes (reinicios, varias instancias). */
    dedupeKey: string
}

const BRAND = '#16a34a'

/** Telefone do cadastro → 55DDDNUMERO (so digitos); null se nao der para montar um celular/fixo BR. */
export function normalizeBrazilPhone(raw: string | null | undefined): string | null {
    if (!raw) return null
    let digits = raw.replace(/\D/g, '').replace(/^0+/, '')
    if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) return digits
    if (digits.length === 10 || digits.length === 11) digits = `55${digits}`
    return digits.length === 12 || digits.length === 13 ? digits : null
}

export function absoluteLink(link: string | undefined): string | null {
    if (!link) return null
    return `${config.base_url.replace(/\/$/, '')}${link.startsWith('/') ? link : `/${link}`}`
}

function escapeHtml(text: string): string {
    return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

export function notificationEmail(title: string, body: string, url: string | null): string {
    const paragraphs = body
        .split('\n')
        .filter(Boolean)
        .map((line) => `<p style="font-size:14px;line-height:1.6">${escapeHtml(line)}</p>`)
        .join('')
    const button = url
        ? `<p style="margin:24px 0"><a href="${escapeHtml(url)}" style="background:${BRAND};color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;display:inline-block">Abrir no Solo App</a></p>`
        : ''
    return shell(escapeHtml(title), paragraphs + button)
}

/** Evolution API. Sem configuracao ou sem telefone: pula (retorna false), sem erro. */
export async function sendWhatsApp(phone: string | null | undefined, text: string): Promise<boolean> {
    const url = process.env.WHATSAPP_EVOLUTION_URL
    const apiKey = process.env.WHATSAPP_EVOLUTION_API_KEY
    const instance = process.env.WHATSAPP_EVOLUTION_INSTANCE
    if (process.env.WHATSAPP_PROVIDER !== 'evolution' || !url || !apiKey || !instance) return false

    const number = normalizeBrazilPhone(phone)
    if (!number) {
        console.log('[notifications] WhatsApp ignorado: telefone ausente ou inválido')
        return false
    }

    const response = await fetch(`${url.replace(/\/$/, '')}/message/sendText/${encodeURIComponent(instance)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: apiKey },
        body: JSON.stringify({ number, text }),
        signal: AbortSignal.timeout(15_000),
    })
    if (!response.ok) throw new Error(`Evolution API ${response.status}: ${(await response.text()).slice(0, 200)}`)
    return true
}

function adminEmails(): string[] {
    return (process.env.ADMIN_ALERT_EMAIL ?? '').split(',').map((e) => e.trim()).filter(Boolean)
}

/**
 * Registra a notificacao (in-app) e envia por e-mail e WhatsApp. A linha e criada ANTES
 * do envio: a dedupeKey unica faz a segunda tentativa falhar no banco e nao reenviar.
 * Nunca lanca erro — notificacao nao pode derrubar o fluxo de quem chamou.
 * Retorna true quando esta chamada criou (e tentou enviar) a notificacao.
 */
export async function notify(input: NotifyInput): Promise<boolean> {
    let id: string
    try {
        const row = await prisma.notification.create({
            data: {
                clientId: input.clientId,
                type: input.type,
                title: input.title,
                body: input.body,
                link: input.link ?? null,
                dedupeKey: input.dedupeKey,
                channels: input.clientId ? ['in_app'] : [],
            },
            select: { id: true },
        })
        id = row.id
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return false
        console.error('[notifications] falha ao registrar notificação:', input.dedupeKey, error)
        return false
    }

    const channels: string[] = input.clientId ? ['in_app'] : []
    const errors: string[] = []
    const url = absoluteLink(input.link)

    try {
        const client = input.clientId
            ? await prisma.client.findUnique({ where: { id: input.clientId }, select: { email: true, phone: true } })
            : null
        const recipients = input.clientId ? (client?.email ? [client.email] : []) : adminEmails()

        const html = notificationEmail(input.title, input.body, url)
        for (const to of recipients) {
            try {
                await sendMail({ to, subject: `${input.title} — Solo Energia`, html })
                if (!channels.includes('email')) channels.push('email')
            } catch (error) {
                errors.push(`email: ${(error as Error).message}`)
            }
        }

        if (client) {
            try {
                const text = [`*${input.title}*`, input.body, url].filter(Boolean).join('\n\n')
                if (await sendWhatsApp(client.phone, text)) channels.push('whatsapp')
            } catch (error) {
                errors.push(`whatsapp: ${(error as Error).message}`)
            }
        }
    } catch (error) {
        errors.push((error as Error).message)
    }

    try {
        await prisma.notification.update({
            where: { id },
            data: { channels, error: errors.length ? errors.join(' | ').slice(0, 1000) : null },
        })
    } catch (error) {
        console.error('[notifications] falha ao atualizar notificação:', id, error)
    }
    if (errors.length) console.error('[notifications] falhas no envio:', input.dedupeKey, errors)
    return true
}
