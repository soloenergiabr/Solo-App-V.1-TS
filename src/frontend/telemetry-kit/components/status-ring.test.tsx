// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusRing } from './status-ring'

describe('StatusRing', () => {
    it('renders the label', () => {
        render(<StatusRing label="Casa" status="ok" />)
        expect(screen.getByText('Casa')).toBeInTheDocument()
    })
    it('exposes the status for assistive tech and styling', () => {
        render(<StatusRing label="Loja" status="critical" />)
        const root = screen.getByTestId('status-ring')
        expect(root).toHaveAttribute('data-status', 'critical')
        expect(root).toHaveAttribute('aria-label', 'Loja: crítico')
    })
})
