// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PaybackGauge } from './payback-gauge'

describe('PaybackGauge', () => {
    it('shows the percent paid derived from invested/returned', () => {
        render(<PaybackGauge totalInvested={50000} returned={31000} />)
        expect(screen.getByText('62%')).toBeInTheDocument()
    })
    it('shows the invested vs returned amounts in BRL', () => {
        render(<PaybackGauge totalInvested={50000} returned={31000} />)
        expect(screen.getByText('R$ 31.000 / R$ 50.000')).toBeInTheDocument()
    })
    it('renders the optional payoff label when provided', () => {
        render(
            <PaybackGauge
                totalInvested={50000}
                returned={31000}
                payoffLabel="mar/2027"
            />,
        )
        expect(screen.getByText(/mar\/2027/)).toBeInTheDocument()
    })
})
