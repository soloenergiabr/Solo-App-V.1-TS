// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MetricTile } from './metric-tile'

describe('MetricTile', () => {
    it('renders label, value and sublabel', () => {
        render(<MetricTile label="DINHEIRO" value="R$ 643" sublabel="economia mês" />)
        expect(screen.getByText('DINHEIRO')).toBeInTheDocument()
        expect(screen.getByText('R$ 643')).toBeInTheDocument()
        expect(screen.getByText('economia mês')).toBeInTheDocument()
    })
    it('renders without a sublabel', () => {
        render(<MetricTile label="ENERGIA" value="980 kWh" />)
        expect(screen.getByText('980 kWh')).toBeInTheDocument()
    })
})
