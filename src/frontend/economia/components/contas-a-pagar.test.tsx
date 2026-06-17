// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ContasAPagar } from './contas-a-pagar'
import type { AccountBill } from '@/shared/controle/types'

const bill = (over: Partial<AccountBill>): AccountBill => ({
    id: 'b1', consumerUnitId: 'u1', consumerUnitName: 'Casa', distributor: 'Enel', accountNumber: '123',
    referenceMonth: 4, referenceYear: 2026, amountDue: 187, dueDate: '2026-04-12', paidAt: null,
    paymentStatus: 'a_pagar', pixCode: 'PIX-CASA', barcode: null, billFileUrl: null,
    estimatedSavings: 410, titularName: 'Gabriel', payerName: 'Mateus', aiAnalysis: null, ...over,
})

describe('ContasAPagar', () => {
    beforeEach(() => Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } }))
    it('lists each bill with amount and a copy-pix button when payable', () => {
        render(<ContasAPagar bills={[bill({})]} />)
        expect(screen.getByText('Casa')).toBeInTheDocument()
        expect(screen.getByText('R$ 187')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /copiar pix/i })).toBeInTheDocument()
    })
    it('shows paid bills without a copy button', () => {
        render(<ContasAPagar bills={[bill({ paymentStatus: 'paga', paidAt: '2026-04-03' })]} />)
        expect(screen.queryByRole('button', { name: /copiar pix/i })).toBeNull()
        expect(screen.getByText(/paga/i)).toBeInTheDocument()
    })
})
