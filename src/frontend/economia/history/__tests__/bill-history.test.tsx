// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Must mock before any imports that use the hook
const mockUseBillHistory = vi.fn()
vi.mock('../use-bill-history', () => ({
    useBillHistory: () => mockUseBillHistory(),
}))

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}))

import { BillHistory } from '../bill-history'

const bill1 = {
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
    paymentStatus: 'paga' as const,
    pixCode: null,
    barcode: null,
    billFileUrl: null,
    estimatedSavings: 85.5,
    titularName: 'João',
    payerName: 'João',
    aiAnalysis: null,
}

const bill2 = {
    id: 'bill-2',
    consumerUnitId: 'uc-2',
    consumerUnitName: 'UC Comercial',
    distributor: 'Light',
    accountNumber: '456',
    referenceMonth: 3,
    referenceYear: 2026,
    amountDue: 520.0,
    dueDate: '2026-04-10',
    paidAt: null,
    paymentStatus: 'a_pagar' as const,
    pixCode: null,
    barcode: null,
    billFileUrl: null,
    estimatedSavings: 120.0,
    titularName: 'Maria',
    payerName: 'Maria',
    aiAnalysis: null,
}

const bill3 = {
    id: 'bill-3',
    consumerUnitId: 'uc-1',
    consumerUnitName: 'UC Residencial',
    distributor: 'Light',
    accountNumber: '789',
    referenceMonth: 11,
    referenceYear: 2025,
    amountDue: 300.0,
    dueDate: '2025-12-10',
    paidAt: null,
    paymentStatus: 'vencida' as const,
    pixCode: null,
    barcode: null,
    billFileUrl: null,
    estimatedSavings: 60.0,
    titularName: 'João',
    payerName: 'João',
    aiAnalysis: null,
}

describe('BillHistory', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows loading skeletons', () => {
        mockUseBillHistory.mockReturnValue({
            bills: null,
            isLoading: true,
            error: null,
            refetch: vi.fn(),
        })
        render(<BillHistory />)
        expect(screen.getByTestId('bill-history-loading')).toBeInTheDocument()
    })

    it('shows empty state message when no bills', () => {
        mockUseBillHistory.mockReturnValue({
            bills: [],
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        })
        render(<BillHistory />)
        expect(screen.getByTestId('bill-history-empty')).toBeInTheDocument()
        expect(screen.getByText('Você ainda não tem contas no histórico.')).toBeInTheDocument()
    })

    it('shows error alert', () => {
        mockUseBillHistory.mockReturnValue({
            bills: null,
            isLoading: false,
            error: 'Erro de rede',
            refetch: vi.fn(),
        })
        render(<BillHistory />)
        expect(screen.getByTestId('bill-history-error')).toBeInTheDocument()
        expect(screen.getByText('Erro de rede')).toBeInTheDocument()
    })

    it('renders bills grouped by year (newest first)', () => {
        mockUseBillHistory.mockReturnValue({
            bills: [bill1, bill2, bill3],
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        })
        render(<BillHistory />)
        expect(screen.getByTestId('bill-history-table')).toBeInTheDocument()

        // Year headers in order: 2026 then 2025
        const headings = screen.getAllByRole('heading')
        expect(headings[0]).toHaveTextContent('2026')
        expect(headings[1]).toHaveTextContent('2025')

        // Month names in pt-BR
        expect(screen.getByText('Janeiro')).toBeInTheDocument()
        expect(screen.getByText('Março')).toBeInTheDocument()
        expect(screen.getByText('Novembro')).toBeInTheDocument()

        // UC names (UC Residencial appears in two years)
        expect(screen.getAllByText('UC Residencial').length).toBeGreaterThanOrEqual(1)
        expect(screen.getByText('UC Comercial')).toBeInTheDocument()

        // Monetary values (formatBRL defaults to whole numbers, no cents)
        expect(screen.getByText('R$ 250')).toBeInTheDocument()
        expect(screen.getByText('R$ 520')).toBeInTheDocument()
        expect(screen.getByText('R$ 300')).toBeInTheDocument()

        // Status badges
        expect(screen.getByText('Paga')).toBeInTheDocument()
        expect(screen.getByText('A pagar')).toBeInTheDocument()
        expect(screen.getByText('Vencida')).toBeInTheDocument()
    })

    it('each row is clickable with correct href', () => {
        mockUseBillHistory.mockReturnValue({
            bills: [bill1, bill2],
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        })
        render(<BillHistory />)

        // Click first row (bill-1)
        const rows = screen.getAllByRole('row')
        // rows[0] is header, rows[1] is first data row
        rows[1].click()
        expect(mockPush).toHaveBeenCalledWith('/economia/bill-1')

        // Click second row (bill-2)
        rows[2].click()
        expect(mockPush).toHaveBeenCalledWith('/economia/bill-2')
    })
})
