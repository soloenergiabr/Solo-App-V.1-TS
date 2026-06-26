// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppSidebar } from './app-sidebar'

// Mock auth context — empty roles → vendedor (client) nav, not admin
vi.mock('@/frontend/auth/contexts/auth-context', () => ({
    useAuthContext: () => ({ user: { name: 'Cliente', roles: [] }, logout: vi.fn() }),
}))

// useIsMobile is a controllable fn so each test can choose desktop vs mobile
const mockUseIsMobile = vi.fn()
vi.mock('@/hooks/use-mobile', () => ({
    useIsMobile: () => mockUseIsMobile(),
}))

// Mock next-themes — no ThemeProvider needed in tests
vi.mock('next-themes', () => ({
    useTheme: () => ({ resolvedTheme: 'dark' }),
}))

// Mock next/navigation — Sidebar uses usePathname internally
vi.mock('next/navigation', () => ({
    usePathname: () => '/controle',
}))

// Mock next/link — render as plain anchor so jsdom doesn't choke on the Next.js router
vi.mock('next/link', () => ({
    default: ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
        <a href={href} onClick={onClick}>{children}</a>
    ),
}))

// Mock next/image — render as plain img
vi.mock('next/image', () => ({
    default: ({ src, alt }: { src: string; alt: string }) => (
        <img src={src} alt={alt} />
    ),
}))

describe('AppSidebar — vendedor (client) navigation', () => {
    beforeEach(() => {
        // Default to desktop; individual tests override as needed
        mockUseIsMobile.mockReturnValue(false)
    })

    it('desktop renders the 4 section headings and representative sub-items', () => {
        render(<AppSidebar />)

        // The four titled sections must appear as <h3> headings
        expect(screen.getByRole('heading', { name: 'Controle' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Energia' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Consumo' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Solo Club' })).toBeInTheDocument()

        // Representative sub-item labels across each section
        expect(screen.getByText('Geração')).toBeInTheDocument()
        expect(screen.getByText('Minhas Usinas')).toBeInTheDocument()
        expect(screen.getByText('Economia')).toBeInTheDocument()
        expect(screen.getByText('Rateio')).toBeInTheDocument()
        expect(screen.getByText('Clube Solo')).toBeInTheDocument()
        expect(screen.getByText('Suporte')).toBeInTheDocument()
    })

    it('Investor Demo is absent from the client nav', () => {
        render(<AppSidebar />)
        // Investor Demo must never appear in the vendedor sidebar — only in admin nav
        expect(screen.queryByText('Investor Demo')).toBeNull()
    })

    it('mobile footer shows the 5 hub labels and hides desktop-only sub-items', () => {
        mockUseIsMobile.mockReturnValue(true)
        render(<AppSidebar />)

        // Hub labels rendered via mobileLabel in the footer
        expect(screen.getByText('Energia')).toBeInTheDocument()
        expect(screen.getByText('Consumo')).toBeInTheDocument()
        expect(screen.getByText('Club')).toBeInTheDocument() // mobileLabel:'Club' overrides label:'Solo Club'

        // Desktop-only sub-items must NOT appear — the footer renders only the 5 hub items
        expect(screen.queryByText('Minhas Usinas')).toBeNull()
        expect(screen.queryByText('Solo Coins')).toBeNull()

        // The full desktop label 'Solo Club' is replaced by the mobileLabel 'Club'
        expect(screen.queryByText('Solo Club')).toBeNull()
    })
})
