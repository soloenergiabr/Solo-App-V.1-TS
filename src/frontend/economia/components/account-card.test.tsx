// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AccountCard } from './account-card'
import type { AccountBill } from '@/shared/controle/types'

const bill: AccountBill = {
    id: 'b1', consumerUnitId: 'u1', consumerUnitName: 'Casa', distributor: 'Enel', accountNumber: 'UC 123456',
    referenceMonth: 3, referenceYear: 2026, amountDue: 187, dueDate: '2026-04-12', paidAt: null,
    paymentStatus: 'a_pagar', pixCode: 'PIX-CASA', barcode: null, billFileUrl: 'http://x/bill.pdf',
    estimatedSavings: 410, titularName: 'Gabriel', payerName: 'Mateus', aiAnalysis: 'bandeira vermelha elevou R$ 38',
}

describe('AccountCard', () => {
    beforeEach(() => Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } }))
    it('shows UC, titular vs payer, amount, savings and copy pix', () => {
        render(<AccountCard bill={bill} />)
        expect(screen.getByText('Casa')).toBeInTheDocument()
        expect(screen.getByText(/Gabriel/)).toBeInTheDocument()
        expect(screen.getByText(/Mateus/)).toBeInTheDocument()
        expect(screen.getByText('R$ 187')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /copiar pix/i })).toBeInTheDocument()
    })
})
