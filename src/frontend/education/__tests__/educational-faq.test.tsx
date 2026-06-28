// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import React from 'react'

const mockGet = vi.fn()

vi.mock('@/frontend/auth/hooks/useAuthenticatedApi', () => ({
    useAuthenticatedApi: () => ({
        get: mockGet,
        post: vi.fn(),
        isAuthenticated: true,
    }),
}))

import { EducationalFaq } from '../educational-faq'

const TITLE = 'Entenda sua conta de energia'

const faqData = [
    {
        id: '1',
        question: 'O que é energia ativa?',
        answer: 'É a energia consumida pelos equipamentos.',
        category: 'consumo',
    },
    {
        id: '2',
        question: 'O que é ICMS na conta de luz?',
        answer: 'É o imposto estadual sobre circulação de mercadorias e serviços.',
        category: 'consumo',
    },
]

describe('EducationalFaq', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders the title and FAQ questions; clicking a trigger reveals its answer', async () => {
        mockGet.mockResolvedValue({ data: { success: true, data: faqData } })

        render(<EducationalFaq category="consumo" />)

        // Wait for loading to finish and content to appear
        await waitFor(() => expect(screen.getByText(TITLE)).toBeInTheDocument())

        // First question should be visible
        expect(screen.getByText(faqData[0].question)).toBeInTheDocument()

        // Answer is not yet in the document (collapsed by default)
        expect(screen.queryByText(faqData[0].answer)).not.toBeInTheDocument()

        // Click the trigger to expand (fireEvent — matches the codebase's Collapsible test pattern)
        fireEvent.click(screen.getByText(faqData[0].question))

        // Answer should now appear
        await waitFor(() =>
            expect(screen.getByText(faqData[0].answer)).toBeInTheDocument(),
        )
    })

    it('renders nothing when FAQ list is empty (empty-safe)', async () => {
        mockGet.mockResolvedValue({ data: { success: true, data: [] } })

        const { container } = render(<EducationalFaq category="consumo" />)

        // Wait for loading to resolve; component must return null
        await waitFor(() => {
            expect(container.firstChild).toBeNull()
        })

        expect(screen.queryByText(TITLE)).toBeNull()
    })

    it('calls GET with /support/faqs?category=consumo (no /api prefix)', async () => {
        mockGet.mockResolvedValue({ data: { success: true, data: faqData } })

        render(<EducationalFaq category="consumo" />)

        await waitFor(() => {
            expect(mockGet).toHaveBeenCalledWith('/support/faqs?category=consumo')
        })
    })
})
