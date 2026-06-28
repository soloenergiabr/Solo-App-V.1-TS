// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SoloClubHub } from '../solo-club-hub'

// Mock next/navigation — PageLayout may use usePathname internally
vi.mock('next/navigation', () => ({
    usePathname: () => '/solo-club',
}))

// Mock next-themes — PageLayout uses useTheme()
vi.mock('next-themes', () => ({
    useTheme: () => ({ resolvedTheme: 'dark', theme: 'dark', setTheme: vi.fn() }),
}))

// Mock next/link — render as plain anchor so jsdom doesn't choke on the Next.js router
vi.mock('next/link', () => ({
    default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
        <a href={href} className={className}>{children}</a>
    ),
}))

// Mock next/image — render as plain img
vi.mock('next/image', () => ({
    default: ({ src, alt }: { src: string; alt: string }) => (
        <img src={src} alt={alt} />
    ),
}))

describe('SoloClubHub', () => {
    it('renders the page title and subtitle', () => {
        render(<SoloClubHub />)

        expect(screen.getByText('Solo Club')).toBeInTheDocument()
        expect(screen.getByText('Suas recompensas, vouchers e Solo Coins em um só lugar')).toBeInTheDocument()
    })

    it('renders Clube Solo as a link to /club', () => {
        render(<SoloClubHub />)

        const link = screen.getByRole('link', { name: /Clube Solo/ })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/club')
    })

    it('renders Meus Vouchers as a link to /vouchers', () => {
        render(<SoloClubHub />)

        const link = screen.getByRole('link', { name: /Meus Vouchers/ })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/vouchers')
    })

    it('renders Solo Coins as a link to /solo-coins', () => {
        render(<SoloClubHub />)

        const link = screen.getByRole('link', { name: /Solo Coins/ })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/solo-coins')
    })

    it('renders all three card descriptions', () => {
        render(<SoloClubHub />)

        expect(screen.getByText('Vantagens e benefícios do seu clube.')).toBeInTheDocument()
        expect(screen.getByText('Seus vouchers e recompensas resgatadas.')).toBeInTheDocument()
        expect(screen.getByText('Acompanhe e use seus Solo Coins.')).toBeInTheDocument()
    })
})
