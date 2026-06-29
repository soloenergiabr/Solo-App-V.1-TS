// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlowChart } from './glow-chart'

describe('GlowChart', () => {
    it('shows an empty state when there is no data', () => {
        render(<GlowChart data={[]} dataKey="value" xKey="label" />)
        expect(screen.getByText('Sem dados no período')).toBeInTheDocument()
    })

    it('uses design tokens, not hardcoded hex, for stroke', () => {
        const { container } = render(
            <GlowChart data={[{ label: 'a', v: 1 }, { label: 'b', v: 2 }]} dataKey="v" xKey="label" />,
        )
        const html = container.innerHTML
        // Verify no hardcoded hex colors from the old palette
        expect(html).not.toContain('#ff481e')
        expect(html).not.toContain('#f5a623')
        // Verify dark-only hardcoded tooltip colors are not present
        expect(html).not.toContain('hsl(0 0% 11%)')
        expect(html).not.toContain('hsl(0 0% 16%)')
        expect(html).not.toContain('hsl(48 9% 88%)')
    })
})
