// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LiveBadge } from './live-badge'

describe('LiveBadge', () => {
    it('renders the default "ao vivo" text', () => {
        render(<LiveBadge />)
        expect(screen.getByText('ao vivo')).toBeInTheDocument()
    })
    it('renders custom label text', () => {
        render(<LiveBadge label="tempo real" />)
        expect(screen.getByText('tempo real')).toBeInTheDocument()
    })
})
