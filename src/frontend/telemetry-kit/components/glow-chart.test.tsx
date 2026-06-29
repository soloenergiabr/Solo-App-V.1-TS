// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// recharts' ResponsiveContainer measures its parent via ResizeObserver, which
// reports 0x0 in jsdom, so the chart SVG (and its colored stops/strokes) never
// mounts. Replace it with a fixed-size wrapper so the real SVG renders and we
// can assert the design tokens actually reached the DOM.
vi.mock('recharts', async () => {
    const actual = await vi.importActual<typeof import('recharts')>('recharts')
    return {
        ...actual,
        ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
            <actual.ResponsiveContainer width={400} height={300}>
                {children}
            </actual.ResponsiveContainer>
        ),
    }
})

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
        // Positive assertion: the chart-1 design token reached the rendered DOM
        // (appears as stroke="var(--chart-1)" on the Area curve and as
        // stop-color="var(--chart-1)" on the gradient).
        expect(html).toContain('var(--chart-1)')
        // Verify no hardcoded hex colors from the old palette
        expect(html).not.toContain('#ff481e')
        expect(html).not.toContain('#f5a623')
        // Verify dark-only hardcoded tooltip colors are not present
        expect(html).not.toContain('hsl(0 0% 11%)')
        expect(html).not.toContain('hsl(0 0% 16%)')
        expect(html).not.toContain('hsl(48 9% 88%)')
    })
})
