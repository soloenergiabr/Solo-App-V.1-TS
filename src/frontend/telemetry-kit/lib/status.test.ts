import { describe, it, expect } from 'vitest'
import { statusToColor, type TelemetryStatus } from './status'

describe('statusToColor', () => {
    it('maps ok to the success token class', () => {
        expect(statusToColor('ok')).toBe('text-success')
    })
    it('maps warning to the warning token class', () => {
        expect(statusToColor('warning')).toBe('text-warning')
    })
    it('maps critical to the destructive token class', () => {
        expect(statusToColor('critical')).toBe('text-destructive')
    })
    it('maps unknown to the muted token class', () => {
        expect(statusToColor('unknown')).toBe('text-muted-foreground')
    })
    it('accepts every member of the TelemetryStatus union', () => {
        const all: TelemetryStatus[] = ['ok', 'warning', 'critical', 'unknown']
        for (const s of all) expect(typeof statusToColor(s)).toBe('string')
    })
})
