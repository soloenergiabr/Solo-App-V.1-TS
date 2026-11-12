import prisma from '@/lib/prisma'
import type {
    BillPaidPayload,
    BillUploadedPayload,
    FaturapiCredentialsInvalidPayload,
    FaturapiUnitOverduePayload,
    GdChargePaidPayload,
} from '@/backend/shared/event-bus'
import { notify } from './notify'

const DAY_MS = 24 * 60 * 60 * 1000
const SILENT_AFTER_MS = 48 * 60 * 60 * 1000
/** Janela olhada para achar a ultima geracao (limita a consulta). */
const LOOKBACK_MS = 30 * DAY_MS
export const SAVINGS_MILESTONES = [500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000]

type Decimalish = { toString(): string } | number | null | undefined

// ---------- regras puras (testadas) ----------

/** Hoje em America/Fortaleza como meia-noite UTC — mesmo formato dos campos @db.Date. */
export function fortalezaToday(now = new Date()): Date {
    const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Fortaleza' }).format(now)
    return new Date(`${ymd}T00:00:00.000Z`)
}

export function isUnpaid(bill: { paymentStatus: string; paidAt: Date | null }): boolean {
    return bill.paymentStatus !== 'paga' && bill.paidAt == null
}

/** Lembrete do dia: 3 dias antes e no dia do vencimento, so para faturas em aberto. */
export function dueReminderKind(
    bill: { paymentStatus: string; paidAt: Date | null; dueDate: Date | null },
    today: Date,
): 'd3' | 'd0' | null {
    if (!bill.dueDate || !isUnpaid(bill)) return null
    const days = Math.round((bill.dueDate.getTime() - today.getTime()) / DAY_MS)
    return days === 3 ? 'd3' : days === 0 ? 'd0' : null
}

/** "Nova fatura": nao anuncia faturas ja pagas ou vencidas (ex.: historico importado). */
export function shouldAnnounceNewBill(
    bill: { paymentStatus: string; paidAt: Date | null; dueDate: Date | null },
    today: Date,
): boolean {
    return isUnpaid(bill) && (bill.dueDate == null || bill.dueDate.getTime() >= today.getTime())
}

/** Maior marco de economia ja atingido (ou null). */
export function reachedSavingsMilestone(total: number): number | null {
    return [...SAVINGS_MILESTONES].reverse().find((m) => total >= m) ?? null
}

export function isSilent(lastProductiveAt: Date | null, now: Date): boolean {
    return !lastProductiveAt || now.getTime() - lastProductiveAt.getTime() >= SILENT_AFTER_MS
}

// ---------- formatacao ----------

function brl(value: Decimalish): string {
    return value == null ? '—' : Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function ptDate(value: Date | null): string {
    return value ? value.toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—'
}

function ymd(date: Date): string {
    return date.toISOString().slice(0, 10)
}

function reference(month: number, year: number): string {
    return `${String(month).padStart(2, '0')}/${year}`
}

const billSelect = {
    id: true, clientId: true, referenceMonth: true, referenceYear: true, dueDate: true,
    paymentStatus: true, paidAt: true, amountDue: true, totalBillValue: true,
    consumerUnit: { select: { name: true } },
} as const

function unitLabel(name: string | null | undefined): string {
    return name ? `da unidade ${name}` : ''
}

// ---------- gatilhos por evento ----------

export async function onBillUploaded({ billId, clientId }: BillUploadedPayload): Promise<void> {
    const bill = await prisma.energyBill.findUnique({ where: { id: billId }, select: billSelect })
    if (bill && shouldAnnounceNewBill(bill, fortalezaToday())) {
        await notify({
            clientId: bill.clientId,
            type: 'bill_available',
            title: 'Nova fatura disponível',
            body: [
                `A fatura ${reference(bill.referenceMonth, bill.referenceYear)} ${unitLabel(bill.consumerUnit?.name)} já está no Solo App.`.replace(/\s+/g, ' '),
                `Valor: ${brl(bill.amountDue ?? bill.totalBillValue)}`,
                `Vencimento: ${ptDate(bill.dueDate)}`,
            ].join('\n'),
            link: `/economia/${bill.id}`,
            dedupeKey: `bill-available:${bill.id}`,
        })
    }
    await checkSavingsMilestone(bill?.clientId ?? clientId)
}

export async function onBillPaid({ billId }: BillPaidPayload): Promise<void> {
    const bill = await prisma.energyBill.findUnique({ where: { id: billId }, select: billSelect })
    if (!bill) return
    await notify({
        clientId: bill.clientId,
        type: 'payment_confirmed',
        title: 'Pagamento confirmado',
        body: `Registramos o pagamento da fatura ${reference(bill.referenceMonth, bill.referenceYear)} ${unitLabel(bill.consumerUnit?.name)} no valor de ${brl(bill.amountDue ?? bill.totalBillValue)}.`.replace(/\s+/g, ' '),
        link: `/economia/${bill.id}`,
        dedupeKey: `bill-paid:${bill.id}`,
    })
}

export async function onGdChargePaid({ chargeId }: GdChargePaidPayload): Promise<void> {
    const charge = await prisma.charge.findUnique({
        where: { id: chargeId },
        select: { id: true, clientId: true, referenceMonth: true, referenceYear: true, amount: true, payerName: true, consumerUnit: { select: { name: true } } },
    })
    if (!charge) return
    await notify({
        clientId: charge.clientId,
        type: 'payment_confirmed',
        title: 'Pagamento da cobrança confirmado',
        body: `A cobrança ${reference(charge.referenceMonth, charge.referenceYear)} ${unitLabel(charge.consumerUnit?.name)} (${brl(charge.amount)})${charge.payerName ? `, de ${charge.payerName},` : ''} foi marcada como paga.`.replace(/\s+/g, ' '),
        link: '/controle',
        dedupeKey: `gd-charge-paid:${charge.id}`,
    })
}

export async function onFaturapiUnitOverdue({ consumerUnitId, clientId, overdueSince }: FaturapiUnitOverduePayload): Promise<void> {
    const unit = await prisma.consumerUnit.findUnique({ where: { id: consumerUnitId }, select: { name: true, client: { select: { name: true } } } })
    const episode = overdueSince ? overdueSince.slice(0, 10) : ymd(fortalezaToday())
    await notify({
        clientId,
        type: 'reading_problem',
        title: 'Fatura ainda não publicada pela distribuidora',
        body: `A fatura deste mês ${unitLabel(unit?.name)} ainda não apareceu no site da distribuidora no prazo esperado (leitura atrasada). Estamos acompanhando e avisaremos assim que ela chegar.`.replace(/\s+/g, ' '),
        link: '/consumo',
        dedupeKey: `reading-overdue:${consumerUnitId}:${episode}`,
    })
    await notify({
        clientId: null,
        type: 'admin_alert',
        title: 'UC com fatura atrasada na distribuidora',
        body: `Cliente: ${unit?.client.name ?? clientId}\nUnidade: ${unit?.name ?? consumerUnitId}\nAtrasada desde: ${overdueSince ? ptDate(new Date(overdueSince)) : '—'}`,
        link: '/admin/faturapi',
        dedupeKey: `admin:reading-overdue:${consumerUnitId}:${episode}`,
    })
}

export async function onFaturapiCredentialsInvalid({ consumerUnitIds }: FaturapiCredentialsInvalidPayload): Promise<void> {
    const units = await prisma.consumerUnit.findMany({
        where: { id: { in: consumerUnitIds } },
        select: { id: true, name: true, clientId: true, client: { select: { name: true } } },
    })
    const today = fortalezaToday()
    for (const unit of units) {
        await notify({
            clientId: unit.clientId,
            type: 'reading_problem',
            title: 'Não conseguimos acessar sua conta na distribuidora',
            body: `A senha da distribuidora cadastrada para buscar a fatura ${unitLabel(unit.name)} foi recusada. Nossa equipe já foi avisada; se você trocou a senha recentemente, fale com o suporte.`.replace(/\s+/g, ' '),
            link: '/support',
            dedupeKey: `reading-credentials:${unit.id}:${ymd(today).slice(0, 7)}`,
        })
    }
    if (units.length === 0) return
    await notify({
        clientId: null,
        type: 'admin_alert',
        title: 'Senha da Enel inválida',
        body: ['A Faturapi recusou a senha destas unidades consumidoras:', ...units.map((u) => `• ${u.client.name} — ${u.name ?? u.id}`)].join('\n'),
        link: '/admin/faturapi',
        dedupeKey: `admin:credentials-invalid:${ymd(today)}:${units.map((u) => u.id).sort().join(',')}`,
    })
}

// ---------- verificacoes (evento e job diario) ----------

export async function checkSavingsMilestone(clientId: string, knownTotal?: number): Promise<void> {
    const total = knownTotal ?? Number((await prisma.energyBill.aggregate({ where: { clientId }, _sum: { estimatedSavings: true } }))._sum.estimatedSavings ?? 0)
    const milestone = reachedSavingsMilestone(total)
    if (!milestone) return
    await notify({
        clientId,
        type: 'savings_milestone',
        title: `Você já economizou ${brl(milestone)}!`,
        body: `Somando as suas faturas, a energia solar já gerou ${brl(total)} de economia para você. Parabéns!`,
        link: '/consumo?tab=economia',
        dedupeKey: `savings:${clientId}:${milestone}`,
    })
}

async function sendDueReminders(today: Date): Promise<number> {
    const bills = await prisma.energyBill.findMany({
        where: {
            paymentStatus: { not: 'paga' },
            paidAt: null,
            dueDate: { gte: today, lte: new Date(today.getTime() + 3 * DAY_MS) },
            client: { deletedAt: null },
        },
        select: billSelect,
    })
    let sent = 0
    for (const bill of bills) {
        const kind = dueReminderKind(bill, today)
        if (!kind) continue
        const created = await notify({
            clientId: bill.clientId,
            type: 'bill_due',
            title: kind === 'd0' ? 'Sua fatura vence hoje' : 'Sua fatura vence em 3 dias',
            body: `A fatura ${reference(bill.referenceMonth, bill.referenceYear)} ${unitLabel(bill.consumerUnit?.name)}, no valor de ${brl(bill.amountDue ?? bill.totalBillValue)}, vence em ${ptDate(bill.dueDate)}. Se já pagou, confirme o pagamento no app.`.replace(/\s+/g, ' '),
            link: `/economia/${bill.id}`,
            dedupeKey: `bill-due:${bill.id}:${kind}`,
        })
        if (created) sent++
    }
    return sent
}

async function checkAllSavingsMilestones(): Promise<void> {
    const totals = await prisma.energyBill.groupBy({
        by: ['clientId'],
        where: { client: { deletedAt: null } },
        _sum: { estimatedSavings: true },
    })
    for (const row of totals) {
        const total = Number(row._sum.estimatedSavings ?? 0)
        if (reachedSavingsMilestone(total)) await checkSavingsMilestone(row.clientId, total)
    }
}

export interface SilentInverter {
    id: string
    name: string
    clientId: string
    clientName: string
    plantName: string | null
    lastProductiveAt: Date | null
}

/**
 * Inversores ativos (sync ligado, nao manuais, cadastrados ha mais de 48h) sem nenhuma
 * leitura com energia/potencia > 0 nas ultimas 48h.
 */
export async function findSilentInverters(now = new Date()): Promise<SilentInverter[]> {
    const inverters = await prisma.inverter.findMany({
        where: {
            deletedAt: null,
            syncEnabled: true,
            provider: { not: 'manual' },
            createdAt: { lt: new Date(now.getTime() - SILENT_AFTER_MS) },
            client: { deletedAt: null },
            OR: [{ plantId: null }, { plant: { deletedAt: null } }],
        },
        select: { id: true, name: true, providerPlantName: true, clientId: true, client: { select: { name: true } }, plant: { select: { name: true } } },
    })
    if (inverters.length === 0) return []

    const productive = await prisma.generationUnit.groupBy({
        by: ['inverterId'],
        where: {
            inverterId: { in: inverters.map((i) => i.id) },
            deletedAt: null,
            timestamp: { gte: new Date(now.getTime() - LOOKBACK_MS) },
            OR: [{ energy: { gt: 0 } }, { power: { gt: 0 } }],
        },
        _max: { timestamp: true },
    })
    const lastById = new Map(productive.map((p) => [p.inverterId, p._max.timestamp]))

    return inverters
        .map((i) => ({
            id: i.id,
            name: i.name ?? i.providerPlantName ?? 'Inversor',
            clientId: i.clientId,
            clientName: i.client.name,
            plantName: i.plant?.name ?? null,
            lastProductiveAt: lastById.get(i.id) ?? null,
        }))
        .filter((i) => isSilent(i.lastProductiveAt, now))
}

async function sendNoGenerationAlerts(now: Date): Promise<number> {
    const silent = await findSilentInverters(now)
    const fresh: SilentInverter[] = []
    for (const inv of silent) {
        // Um aviso por "episodio": so volta a avisar depois que o inversor gerar de novo e parar outra vez.
        const episode = inv.lastProductiveAt ? ymd(inv.lastProductiveAt) : 'sem-dados'
        const created = await notify({
            clientId: inv.clientId,
            type: 'no_generation',
            title: 'Usina sem geração há 48 horas',
            body: `Não recebemos geração do inversor ${inv.name}${inv.plantName ? ` (usina ${inv.plantName})` : ''} nas últimas 48 horas. Pode ser falta de internet no inversor ou um problema no equipamento. Nossa equipe já foi avisada.`,
            link: '/energia',
            dedupeKey: `no-generation:${inv.id}:${episode}`,
        })
        if (created) fresh.push(inv)
    }
    if (fresh.length > 0) {
        await notify({
            clientId: null,
            type: 'admin_alert',
            title: `${fresh.length} inversor(es) sem geração há 48h`,
            body: ['Inversores que pararam de gerar:', ...fresh.map((i) => `• ${i.clientName} — ${i.name}${i.plantName ? ` (${i.plantName})` : ''} — última geração: ${i.lastProductiveAt ? ptDate(i.lastProductiveAt) : 'sem dados nos últimos 30 dias'}`)].join('\n'),
            link: '/dashboard',
            dedupeKey: `admin:no-generation:${ymd(fortalezaToday(now))}:${fresh.map((i) => i.id).sort().join(',')}`,
        })
    }
    return fresh.length
}

/** Job diario: lembretes de vencimento, marcos de economia e falta de geracao. Cada etapa isolada. */
export async function runDailyNotifications(now = new Date()) {
    const today = fortalezaToday(now)
    const summary = { dueReminders: 0, noGeneration: 0, errors: [] as string[] }
    const steps: [string, () => Promise<void>][] = [
        ['vencimentos', async () => { summary.dueReminders = await sendDueReminders(today) }],
        ['economia', checkAllSavingsMilestones],
        ['geração', async () => { summary.noGeneration = await sendNoGenerationAlerts(now) }],
    ]
    for (const [name, step] of steps) {
        try {
            await step()
        } catch (error) {
            console.error(`[notifications] etapa ${name} falhou:`, error)
            summary.errors.push(`${name}: ${(error as Error).message}`)
        }
    }
    console.log('[notifications] job diário concluído', summary)
    return summary
}

/** Embrulha um gatilho para listener do event bus: nunca propaga erro. */
export function safeListener<T>(name: string, fn: (payload: T) => Promise<void>) {
    return (payload: T) => {
        fn(payload).catch((error) => console.error(`[notifications] ${name} falhou:`, error))
    }
}
