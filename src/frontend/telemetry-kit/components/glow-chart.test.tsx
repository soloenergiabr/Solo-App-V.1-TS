// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlowChart } from './glow-chart'

describe('GlowChart', () => {
    it('shows an empty state when there is no data', () => {
        render(<GlowChart data={[]} dataKey="value" xKey="label" />)
        expect(screen.getByText('Sem dados no período')).toBeInTheDocument()
    })
})
