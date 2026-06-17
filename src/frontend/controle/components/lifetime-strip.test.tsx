// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LifetimeStrip } from './lifetime-strip'

describe('LifetimeStrip', () => {
    it('renders lifetime generation, return and months', () => {
        render(<LifetimeStrip totalGeneratedKwh={18420} totalReturn={31000} monthsActive={14} co2AvoidedTons={8.2} />)
        expect(screen.getByText(/18\.420 kWh/)).toBeInTheDocument()
        expect(screen.getByText(/R\$ 31\.000/)).toBeInTheDocument()
        expect(screen.getByText(/14 meses/)).toBeInTheDocument()
    })
})
