// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RateioBar } from './rateio-bar'

describe('RateioBar', () => {
    it('renders each slice label with its percentage', () => {
        render(<RateioBar slices={[
            { toUnitId: 'a', toUnitName: 'Casa', percentage: 40 },
            { toUnitId: 'b', toUnitName: 'Mãe', percentage: 25 },
        ]} />)
        expect(screen.getByText(/Casa/)).toBeInTheDocument()
        expect(screen.getByText('40%')).toBeInTheDocument()
        expect(screen.getByText('25%')).toBeInTheDocument()
    })
})
