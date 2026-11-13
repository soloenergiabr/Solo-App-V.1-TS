import { fortalezaToday, runDailyNotifications } from './triggers'

const CHECK_EVERY_MS = 10 * 60 * 1000
let handle: ReturnType<typeof setInterval> | undefined
let lastRunDay: string | undefined

function fortalezaHour(now: Date): number {
    return Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Fortaleza', hour: 'numeric', hourCycle: 'h23' }).format(now))
}

/** Roda o job uma vez por dia a partir de NOTIFICATIONS_HOUR (hora de Fortaleza). */
export function shouldRunNow(now: Date, hour: number, lastDay: string | undefined): boolean {
    return fortalezaHour(now) >= hour && fortalezaToday(now).toISOString().slice(0, 10) !== lastDay
}

/**
 * Agenda as notificacoes diarias em processo. Desligado com NOTIFICATIONS_ENABLED=false.
 * Varias instancias rodando ao mesmo tempo nao duplicam envio (dedupeKey no banco).
 */
export function startNotificationsScheduler(): void {
    if (handle || process.env.NOTIFICATIONS_ENABLED === 'false') return
    const parsed = Number(process.env.NOTIFICATIONS_HOUR ?? 9)
    const hour = Number.isInteger(parsed) && parsed >= 0 && parsed <= 23 ? parsed : 9

    const tick = () => {
        const now = new Date()
        if (!shouldRunNow(now, hour, lastRunDay)) return
        lastRunDay = fortalezaToday(now).toISOString().slice(0, 10)
        runDailyNotifications(now).catch((error) => console.error('[notifications] job diário falhou:', error))
    }
    handle = setInterval(tick, CHECK_EVERY_MS)
    tick()
}
