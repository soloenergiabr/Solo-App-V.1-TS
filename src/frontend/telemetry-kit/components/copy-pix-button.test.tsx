// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CopyPixButton } from './copy-pix-button'

describe('CopyPixButton', () => {
    it('renders the default label', () => {
        render(<CopyPixButton code="PIX123" />)
        expect(screen.getByRole('button', { name: /copiar pix/i })).toBeInTheDocument()
    })

    it('copies the code and shows confirmation on click', async () => {
        const user = userEvent.setup()
        const writeText = vi.fn().mockResolvedValue(undefined)
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: { writeText },
        })

        render(<CopyPixButton code="PIX123" />)
        await user.click(screen.getByRole('button'))
        expect(writeText).toHaveBeenCalledWith('PIX123')
        expect(await screen.findByText(/copiado/i)).toBeInTheDocument()
    })
})
