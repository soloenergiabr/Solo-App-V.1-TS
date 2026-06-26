// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { AnalyzeBillDialog } from './analyze-bill-dialog'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}))

// Mock sonner toast
const mockToastSuccess = vi.fn()
vi.mock('sonner', () => ({
    toast: { success: (...args: any[]) => mockToastSuccess(...args) },
}))

// Mock Dialog to always render content (avoids Radix portal issues in jsdom)
vi.mock('@/components/ui/dialog', () => ({
    Dialog: ({ children }: any) => <div data-testid="dialog">{children}</div>,
    DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
    DialogDescription: ({ children }: any) => <div>{children}</div>,
    DialogFooter: ({ children }: any) => <div>{children}</div>,
    DialogHeader: ({ children }: any) => <div>{children}</div>,
    DialogTitle: ({ children }: any) => <div>{children}</div>,
    DialogTrigger: ({ children }: any) => <div>{children}</div>,
}))

// Mock Select to use native HTML select (avoids Radix portal issues)
vi.mock('@/components/ui/select', () => ({
    Select: ({ children, value, onValueChange }: any) => (
        <select data-testid="uc-select" value={value} onChange={(e) => onValueChange(e.target.value)}>
            {children}
        </select>
    ),
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
    SelectTrigger: ({ children }: any) => <>{children}</>,
    SelectValue: ({ placeholder }: any) => <option value="">{placeholder}</option>,
}))

// Mock Button to avoid Radix integration issues
vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, disabled, type }: any) => (
        <button type={type || 'button'} onClick={onClick} disabled={disabled}>
            {children}
        </button>
    ),
}))

vi.mock('@/components/ui/alert', () => ({
    Alert: ({ children }: any) => <div data-testid="error-alert">{children}</div>,
    AlertTitle: ({ children }: any) => <div>{children}</div>,
    AlertDescription: ({ children }: any) => <div>{children}</div>,
}))
vi.mock('lucide-react', () => {
    const icons = [
        'Loader2', 'Upload', 'XIcon', 'CheckIcon', 'ChevronDownIcon', 'ChevronUpIcon',
    ]
    const result: Record<string, string> = {}
    for (const name of icons) result[name] = 'div'
    return result
})

// Mock the auth hook
const mockAxiosPost = vi.fn()
const mockAxiosGet = vi.fn()
const mockAxiosInstance = {
    post: mockAxiosPost,
    get: mockAxiosGet,
}

vi.mock('@/frontend/auth/hooks/useAuthenticatedApi', () => ({
    useAuthenticatedApi: () => ({
        axiosInstance: mockAxiosInstance,
        isAuthenticated: true,
        get: mockAxiosGet,
        post: mockAxiosPost,
    }),
}))

function createMockFile(name = 'conta.pdf', size = 1024, type = 'application/pdf'): File {
    const blob = new Blob(['x'.repeat(size)], { type })
    return new File([blob], name, { type })
}

// Polyfill missing DOM methods for jsdom (Radix Select)
if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false
}
if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {}
}

// Helper: select a UC option from the native select
async function selectUCOption(user: ReturnType<typeof userEvent.setup>, value: string) {
    const select = screen.getByTestId('uc-select') as HTMLSelectElement
    await user.selectOptions(select, value)
}

describe('AnalyzeBillDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockAxiosGet.mockResolvedValue({
            data: {
                success: true,
                data: [
                    { id: 'uc-1', name: 'Minha Casa', clientNumber: '123' },
                ],
            },
        })
    })

    it('renders the trigger button with correct label', () => {
        render(<AnalyzeBillDialog />)
        expect(screen.getByText('Analisar conta (PDF)')).toBeInTheDocument()
    })

    it('opens dialog on trigger click and shows title', async () => {
        const user = userEvent.setup()
        render(<AnalyzeBillDialog />)

        await user.click(screen.getByText('Analisar conta (PDF)'))

        await waitFor(() => {
            expect(screen.getByText('Analisar conta de energia')).toBeInTheDocument()
        })

        expect(mockAxiosGet).toHaveBeenCalledWith('/client/consumer-units')
    })

    it('shows file name after selecting a file', async () => {
        const user = userEvent.setup()
        render(<AnalyzeBillDialog />)

        await user.click(screen.getByText('Analisar conta (PDF)'))
        await waitFor(() => {
            expect(screen.getByText('Analisar conta de energia')).toBeInTheDocument()
        })

        const fileInput = screen.getByLabelText(/arquivo da conta/i) as HTMLInputElement
        await user.upload(fileInput, createMockFile())

        expect(screen.getByText(/conta\.pdf/)).toBeInTheDocument()
    })

    it('submits multipart POST and redirects on success', async () => {
        mockAxiosPost.mockImplementationOnce(() =>
            new Promise((resolve) =>
                setTimeout(
                    () =>
                        resolve({
                            data: { success: true, data: { id: 'bill-123', status: 'draft' } },
                        }),
                    200,
                ),
            ),
        )

        const user = userEvent.setup()
        const onSuccess = vi.fn()
        render(<AnalyzeBillDialog onSuccess={onSuccess} />)

        // Open dialog
        await user.click(screen.getByText('Analisar conta (PDF)'))
        await waitFor(() => {
            expect(screen.getByText('Analisar conta de energia')).toBeInTheDocument()
        })

        // Select UC via native select
        await selectUCOption(user, 'uc-1')

        // Select file
        const fileInput = screen.getByLabelText(/arquivo da conta/i) as HTMLInputElement
        await user.upload(fileInput, createMockFile())

        // Click submit — exact text match distinguishes from "Analisar conta (PDF)"
        const submitBtn = screen.getByText('Analisar conta', { exact: true })
        await user.click(submitBtn)

        // Should show processing state
        await waitFor(() => {
            expect(screen.getByText(/Analisando sua conta com IA/)).toBeInTheDocument()
        })

        // After success, should redirect
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/economia/bill-123')
        })

        expect(mockAxiosPost).toHaveBeenCalledWith(
            '/client/energy-bills/upload',
            expect.any(FormData),
        )
        expect(mockToastSuccess).toHaveBeenCalled()
        expect(onSuccess).toHaveBeenCalled()
    })

    it('shows error alert when upload fails with server message', async () => {
        mockAxiosPost.mockRejectedValueOnce({
            response: { data: { message: 'Arquivo muito grande. Máximo 10MB.' } },
        })

        const user = userEvent.setup()
        render(<AnalyzeBillDialog />)

        // Open dialog
        await user.click(screen.getByText('Analisar conta (PDF)'))
        await waitFor(() => {
            expect(screen.getByText('Analisar conta de energia')).toBeInTheDocument()
        })

        // Select UC via native select
        await selectUCOption(user, 'uc-1')

        // Select file
        const fileInput = screen.getByLabelText(/arquivo da conta/i) as HTMLInputElement
        await user.upload(fileInput, createMockFile())

        // Submit
        const submitBtn = screen.getByText('Analisar conta', { exact: true })
        await user.click(submitBtn)

        // Should show error
        await waitFor(() => {
            expect(screen.getByText('Arquivo muito grande. Máximo 10MB.')).toBeInTheDocument()
        })
    })

    it('disables submit button when no UC or file is selected', async () => {
        const user = userEvent.setup()
        render(<AnalyzeBillDialog />)

        await user.click(screen.getByText('Analisar conta (PDF)'))
        await waitFor(() => {
            expect(screen.getByText('Analisar conta de energia')).toBeInTheDocument()
        })

        // Submit button should be disabled initially
        const submitBtn = screen.getByText('Analisar conta', { exact: true })
        expect(submitBtn).toBeDisabled()
    })
})
