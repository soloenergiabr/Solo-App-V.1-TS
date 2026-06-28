// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import type { AccountBill } from '@/shared/controle/types'

// Must mock before any imports that use the hook
const mockUseBillHistory = vi.fn()
vi.mock('../use-bill-history', () => ({
    useBillHistory: () => mockUseBillHistory(),
}))

// Mock Select to native HTML select to avoid Radix portal issues in jsdom
vi.mock('@/components/ui/select', () => ({
    Select: ({ children, value, onValueChange }: any) => (
        <select value={value} onChange={(e) => onValueChange?.(e.target.value)}>
            {children}
        </select>
    ),
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
    SelectTrigger: ({ children }: any) => <>{children}</>,
    SelectValue: ({ placeholder }: any) => <option value="">{placeholder}</option>,
}))

import { BillCompare } from '../bill-compare'

const bill1: AccountBill = {
    id: 'bill-1',
    consumerUnitId: 'uc-1',
    consumerUnitName: 'UC Residencial',
    distributor: 'Light',
    accountNumber: '123',
    referenceMonth: 1,
    referenceYear: 2026,
    amountDue: 250.0,
    dueDate: '2026-02-10',
    paidAt: '2026-02-05',
    paymentStatus: 'paga',
    pixCode: null,
    barcode: null,
    billFileUrl: null,
    estimatedSavings: 85.0,
    titularName: 'João',
    payerName: 'João',
    aiAnalysis: null,
    energyCost: 180.0,
    icmsCost: 30.0,
}

const bill2: AccountBill = {
    id: 'bill-2',
    consumerUnitId: 'uc-1',
    consumerUnitName: 'UC Residencial',
    distributor: 'Light',
    accountNumber: '123',
    referenceMonth: 3,
    referenceYear: 2026,
    amountDue: 520.0,
    dueDate: '2026-04-10',
    paidAt: null,
    paymentStatus: 'a_pagar',
    pixCode: null,
    barcode: null,
    billFileUrl: null,
    estimatedSavings: 120.0,
    titularName: 'João',
    payerName: 'João',
    aiAnalysis: null,
    energyCost: 400.0,
    icmsCost: 65.0,
}

describe('BillCompare', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows empty state when fewer than 2 bills exist', () => {
        mockUseBillHistory.mockReturnValue({
            bills: [bill1],
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        })
        render(<BillCompare />)
        expect(
            screen.getByText('Você precisa de pelo menos duas contas para comparar.'),
        ).toBeInTheDocument()
        expect(screen.getByTestId('bill-compare-empty')).toBeInTheDocument()
    })

    it('shows instructional text when 2+ bills exist but none selected', () => {
        mockUseBillHistory.mockReturnValue({
            bills: [bill1, bill2],
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        })
        render(<BillCompare />)
        expect(
            screen.getByText('Selecione duas contas para comparar.'),
        ).toBeInTheDocument()
        expect(screen.getByTestId('bill-compare-prompt')).toBeInTheDocument()
        // Comparison table should NOT be visible yet
        expect(screen.queryByText('Você pagou')).not.toBeInTheDocument()
    })

    it('renders comparison table with signed delta values when two bills are selected', async () => {
        mockUseBillHistory.mockReturnValue({
            bills: [bill1, bill2],
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        })
        const user = userEvent.setup()
        render(<BillCompare />)

        // Select the two bills via the native selects
        const selects = screen.getAllByRole('combobox')
        expect(selects).toHaveLength(2)

        await user.selectOptions(selects[0], 'bill-1')
        await user.selectOptions(selects[1], 'bill-2')

        // Metric rows are now visible
        expect(screen.getByText('Você pagou')).toBeInTheDocument()
        expect(screen.getByText('Economia')).toBeInTheDocument()
        expect(screen.getByText('Custo de energia')).toBeInTheDocument()
        expect(screen.getByText('ICMS')).toBeInTheDocument()

        // Both bill values appear in columns (amountDue)
        expect(screen.getByText('R$ 250')).toBeInTheDocument()
        expect(screen.getByText('R$ 520')).toBeInTheDocument()

        // Delta column header present
        expect(screen.getByRole('columnheader', { name: 'Δ' })).toBeInTheDocument()

        // At least one signed delta appears (bill2.amountDue - bill1.amountDue = 270 → "+R$ 270 ↑")
        expect(screen.getByText(/\+R\$ 270/)).toBeInTheDocument()
    })
})
