import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Prisma } from '@/app/generated/prisma'

const { mockCreate, mockUpdate, mockClientFind, mockSendMail, mockBillFind, mockBillFindMany, mockAggregate } = vi.hoisted(() => ({
    mockCreate: vi.fn(),
    mockUpdate: vi.fn(),
    mockClientFind: vi.fn(),
    mockSendMail: vi.fn(),
    mockBillFind: vi.fn(),
    mockBillFindMany: vi.fn(),
    mockAggregate: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
    default: {
        notification: { create: mockCreate, update: mockUpdate },
        client: { findUnique: mockClientFind },
        energyBill: { findUnique: mockBillFind, findMany: mockBillFindMany, aggregate: mockAggregate, groupBy: vi.fn().mockResolvedValue([]) },
        inverter: { findMany: vi.fn().mockResolvedValue([]) },
    },
}))
vi.mock('@/lib/mail', () => ({ sendMail: mockSendMail }))
vi.mock('@/config', () => ({ config: { base_url: 'https://app.soloenergia.com.br/' } }))

import { absoluteLink, normalizeBrazilPhone, notify } from '../notify'
import {
    dueReminderKind,
    fortalezaToday,
    isSilent,
    onBillUploaded,
    reachedSavingsMilestone,
    runDailyNotifications,
    shouldAnnounceNewBill,
} from '../triggers'
import { shouldRunNow } from '../scheduler'

const today = new Date('2026-11-12T00:00:00.000Z')
const d = (iso: string) => new Date(`${iso}T00:00:00.000Z`)
const open = { paymentStatus: 'a_pagar', paidAt: null }

beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
    mockCreate.mockResolvedValue({ id: 'n1' })
    mockUpdate.mockResolvedValue({})
    mockClientFind.mockResolvedValue({ email: 'cliente@example.com', phone: '(85) 99876-5432' })
    mockSendMail.mockResolvedValue(undefined)
    mockAggregate.mockResolvedValue({ _sum: { estimatedSavings: 0 } })
})
afterEach(() => vi.unstubAllGlobals())

describe('normalizeBrazilPhone', () => {
    it.each([
        ['(85) 99876-5432', '5585998765432'],
        ['085 3224-1234', '558532241234'],
        ['+55 85 99876-5432', '5585998765432'],
        ['5585998765432', '5585998765432'],
        ['99876-5432', null],
        ['', null],
        [null, null],
    ])('%s → %s', (raw, expected) => {
        expect(normalizeBrazilPhone(raw)).toBe(expected)
    })
})

describe('absoluteLink', () => {
    it('usa NEXT_PUBLIC_BASE_URL sem barra duplicada', () => {
        expect(absoluteLink('/economia/b1')).toBe('https://app.soloenergia.com.br/economia/b1')
        expect(absoluteLink(undefined)).toBeNull()
    })
})

describe('regras de disparo', () => {
    it('lembrete 3 dias antes e no dia, só para fatura em aberto', () => {
        expect(dueReminderKind({ ...open, dueDate: d('2026-11-15') }, today)).toBe('d3')
        expect(dueReminderKind({ ...open, dueDate: d('2026-11-12') }, today)).toBe('d0')
        expect(dueReminderKind({ ...open, dueDate: d('2026-11-13') }, today)).toBeNull()
        expect(dueReminderKind({ ...open, dueDate: null }, today)).toBeNull()
        expect(dueReminderKind({ paymentStatus: 'paga', paidAt: null, dueDate: d('2026-11-12') }, today)).toBeNull()
        expect(dueReminderKind({ paymentStatus: 'vencida', paidAt: new Date(), dueDate: d('2026-11-12') }, today)).toBeNull()
    })

    it('nova fatura: não anuncia paga nem vencida (histórico)', () => {
        expect(shouldAnnounceNewBill({ ...open, dueDate: d('2026-11-20') }, today)).toBe(true)
        expect(shouldAnnounceNewBill({ ...open, dueDate: null }, today)).toBe(true)
        expect(shouldAnnounceNewBill({ ...open, dueDate: d('2026-10-01') }, today)).toBe(false)
        expect(shouldAnnounceNewBill({ paymentStatus: 'paga', paidAt: null, dueDate: d('2026-11-20') }, today)).toBe(false)
    })

    it('marco de economia é o maior atingido', () => {
        expect(reachedSavingsMilestone(499.99)).toBeNull()
        expect(reachedSavingsMilestone(500)).toBe(500)
        expect(reachedSavingsMilestone(2600)).toBe(2500)
        expect(reachedSavingsMilestone(12000)).toBe(10000)
    })

    it('inversor silencioso: sem geração há 48h ou sem dados', () => {
        const now = new Date('2026-11-12T12:00:00Z')
        expect(isSilent(null, now)).toBe(true)
        expect(isSilent(new Date('2026-11-10T12:00:00Z'), now)).toBe(true)
        expect(isSilent(new Date('2026-11-11T00:00:00Z'), now)).toBe(false)
    })

    it('hoje em Fortaleza (UTC-3)', () => {
        expect(fortalezaToday(new Date('2026-11-13T02:00:00Z')).toISOString()).toBe('2026-11-12T00:00:00.000Z')
    })

    it('scheduler roda uma vez por dia a partir da hora configurada', () => {
        const at10 = new Date('2026-11-12T13:00:00Z') // 10h em Fortaleza
        expect(shouldRunNow(at10, 9, undefined)).toBe(true)
        expect(shouldRunNow(at10, 9, '2026-11-12')).toBe(false)
        expect(shouldRunNow(new Date('2026-11-12T11:00:00Z'), 9, undefined)).toBe(false) // 8h
    })
})

describe('notify', () => {
    const input = { clientId: 'c1', type: 'bill_due' as const, title: 'Sua fatura vence hoje', body: 'Linha 1\nLinha <2>', link: '/economia/b1', dedupeKey: 'bill-due:b1:d0' }

    it('envia e-mail com link absoluto e registra os canais', async () => {
        expect(await notify(input)).toBe(true)
        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ dedupeKey: 'bill-due:b1:d0' }) }))
        const mail = mockSendMail.mock.calls[0][0]
        expect(mail.to).toBe('cliente@example.com')
        expect(mail.html).toContain('https://app.soloenergia.com.br/economia/b1')
        expect(mail.html).toContain('Linha &lt;2&gt;')
        expect(mockUpdate).toHaveBeenCalledWith({ where: { id: 'n1' }, data: { channels: ['in_app', 'email'], error: null } })
    })

    it('dedupe: chave repetida não reenvia', async () => {
        mockCreate.mockRejectedValue(new Prisma.PrismaClientKnownRequestError('dup', { code: 'P2002', clientVersion: 'x' }))
        expect(await notify(input)).toBe(false)
        expect(mockSendMail).not.toHaveBeenCalled()
    })

    it('falha de envio não lança e fica registrada', async () => {
        mockSendMail.mockRejectedValue(new Error('smtp fora'))
        await expect(notify(input)).resolves.toBe(true)
        expect(mockUpdate.mock.calls[0][0].data).toEqual({ channels: ['in_app'], error: 'email: smtp fora' })
    })

    it('WhatsApp via Evolution quando configurado', async () => {
        vi.stubEnv('WHATSAPP_PROVIDER', 'evolution')
        vi.stubEnv('WHATSAPP_EVOLUTION_URL', 'https://evo.example.com/')
        vi.stubEnv('WHATSAPP_EVOLUTION_API_KEY', 'k')
        vi.stubEnv('WHATSAPP_EVOLUTION_INSTANCE', 'solo')
        const fetchMock = vi.fn().mockResolvedValue({ ok: true })
        vi.stubGlobal('fetch', fetchMock)

        await notify(input)

        const [url, init] = fetchMock.mock.calls[0]
        expect(url).toBe('https://evo.example.com/message/sendText/solo')
        expect(init.headers.apikey).toBe('k')
        expect(JSON.parse(init.body).number).toBe('5585998765432')
        expect(mockUpdate.mock.calls[0][0].data.channels).toEqual(['in_app', 'email', 'whatsapp'])
    })

    it('sem WhatsApp configurado não chama a API', async () => {
        const fetchMock = vi.fn()
        vi.stubGlobal('fetch', fetchMock)
        await notify(input)
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it('alerta de admin vai para ADMIN_ALERT_EMAIL', async () => {
        vi.stubEnv('ADMIN_ALERT_EMAIL', 'a@solo.com, b@solo.com')
        await notify({ ...input, clientId: null, type: 'admin_alert' })
        expect(mockSendMail.mock.calls.map((c) => c[0].to)).toEqual(['a@solo.com', 'b@solo.com'])
        expect(mockClientFind).not.toHaveBeenCalled()
    })
})

describe('gatilhos', () => {
    it('nova fatura em aberto notifica com valor, vencimento e link', async () => {
        mockBillFind.mockResolvedValue({
            id: 'b1', clientId: 'c1', referenceMonth: 11, referenceYear: 2026, dueDate: d('2099-01-10'),
            paymentStatus: 'a_pagar', paidAt: null, amountDue: 321.5, totalBillValue: null, consumerUnit: { name: 'Casa' },
        })
        await onBillUploaded({ billId: 'b1', clientId: 'c1', consumerUnitId: 'u1' })
        const data = mockCreate.mock.calls[0][0].data
        expect(data).toMatchObject({ type: 'bill_available', link: '/economia/b1', dedupeKey: 'bill-available:b1' })
        expect(data.body).toContain('R$')
        expect(data.body).toContain('10/01/2099')
    })

    it('job diário envia lembrete só para a fatura que vence hoje/em 3 dias', async () => {
        mockBillFindMany.mockResolvedValue([
            { id: 'b1', clientId: 'c1', referenceMonth: 11, referenceYear: 2026, dueDate: d('2026-11-15'), paymentStatus: 'a_pagar', paidAt: null, amountDue: 100, totalBillValue: null, consumerUnit: null },
            { id: 'b2', clientId: 'c1', referenceMonth: 11, referenceYear: 2026, dueDate: d('2026-11-13'), paymentStatus: 'a_pagar', paidAt: null, amountDue: 100, totalBillValue: null, consumerUnit: null },
        ])
        const summary = await runDailyNotifications(new Date('2026-11-12T13:00:00Z'))
        expect(summary.dueReminders).toBe(1)
        expect(mockCreate.mock.calls[0][0].data.dedupeKey).toBe('bill-due:b1:d3')
    })
})
