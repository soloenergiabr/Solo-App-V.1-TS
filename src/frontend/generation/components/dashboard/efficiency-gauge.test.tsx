// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EfficiencyGauge } from './efficiency-gauge'

describe('EfficiencyGauge', () => {
    it('renders the percent and label', () => {
        render(<EfficiencyGauge percent={94} />)
        expect(screen.getByText('94%')).toBeInTheDocument()
        expect(screen.getByText(/eficiência/i)).toBeInTheDocument()
    })
    it('clamps out-of-range values', () => {
        render(<EfficiencyGauge percent={140} />)
        expect(screen.getByText('100%')).toBeInTheDocument()
    })
})
