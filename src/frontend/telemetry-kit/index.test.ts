import { describe, it, expect } from 'vitest'
import * as kit from './index'

describe('telemetry-kit barrel', () => {
    it('re-exports helpers and components', () => {
        for (const name of [
            'formatBRL',
            'formatKwh',
            'formatKw',
            'formatPercent',
            'calcPaybackPercent',
            'calcSavings',
            'statusToColor',
            'StatusRing',
            'PaybackGauge',
            'MetricTile',
            'CopyPixButton',
            'LiveBadge',
            'GlowChart',
        ]) {
            expect(kit[name as keyof typeof kit]).toBeDefined()
        }
    })
})
