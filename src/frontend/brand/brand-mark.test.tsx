// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrandMark } from './brand-mark'

describe('BrandMark', () => {
    it('renders the gradient mark by default with an accessible name', () => {
        render(<BrandMark />)
        const img = screen.getByAltText('Solo')
        expect(img).toBeInTheDocument()
        expect(img.getAttribute('src')).toContain('mark-gradient')
    })
    it('renders the requested variant', () => {
        render(<BrandMark variant="orange" />)
        expect(screen.getByAltText('Solo').getAttribute('src')).toContain('mark-orange')
    })
    it('applies the size to width and height', () => {
        render(<BrandMark size={48} />)
        const img = screen.getByAltText('Solo')
        expect(img).toHaveAttribute('width', '48')
        expect(img).toHaveAttribute('height', '48')
    })
})
