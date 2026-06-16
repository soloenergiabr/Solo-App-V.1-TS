// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrandLogo } from './brand-logo'

describe('BrandLogo', () => {
    it('renders the wordmark with an accessible name', () => {
        render(<BrandLogo />)
        const img = screen.getByAltText('Solo Energia')
        expect(img).toBeInTheDocument()
        expect(img.getAttribute('src')).toContain('wordmark-light')
    })
    it('forwards a custom height', () => {
        render(<BrandLogo height={40} />)
        expect(screen.getByAltText('Solo Energia')).toHaveAttribute('height', '40')
    })
})
