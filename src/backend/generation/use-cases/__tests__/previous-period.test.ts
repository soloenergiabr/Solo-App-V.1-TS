import { describe, expect, it } from 'vitest'
import { previousPeriodStart } from '../get-dashboard-analytics.use-case'

describe('previousPeriodStart', () => {
    it('mês anterior começa no dia 1, mesmo com meses de tamanhos diferentes', () => {
        // Novembro (30 dias) -> outubro (31 dias) começa em 01/10, não em 02/10
        expect(previousPeriodStart(new Date('2026-11-01T03:00:00Z'), new Date('2026-12-01T02:59:59.999Z')).toISOString())
            .toBe('2026-10-01T03:00:00.000Z')
        // Março -> fevereiro
        expect(previousPeriodStart(new Date('2026-03-01T03:00:00Z'), new Date('2026-04-01T02:59:59.999Z')).toISOString())
            .toBe('2026-02-01T03:00:00.000Z')
    })
    it('ano anterior volta um ano no calendário', () => {
        expect(previousPeriodStart(new Date('2026-01-01T03:00:00Z'), new Date('2027-01-01T02:59:59.999Z')).toISOString())
            .toBe('2025-01-01T03:00:00.000Z')
    })
    it('semana e dia continuam pela duração', () => {
        expect(previousPeriodStart(new Date('2026-11-09T03:00:00Z'), new Date('2026-11-16T03:00:00Z')).toISOString())
            .toBe('2026-11-02T03:00:00.000Z')
    })
})
