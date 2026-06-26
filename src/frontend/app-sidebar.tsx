"use client"

import { Sidebar, SidebarItem, SidebarSection } from "@/components/ui/sidebar"
import { useAuthContext } from "@/frontend/auth/contexts/auth-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { Coins, DollarSign, Gauge, Gift, HelpCircleIcon, Home, Percent, Ticket, Zap } from "lucide-react"
import { useTheme } from "next-themes"

const adminSections: SidebarSection[] = [
    {
        title: 'Principal',
        items: [
            { label: 'Dashboard', href: '/dashboard', icon: <Home className="w-5 h-5" /> },
            { label: 'Clientes', href: '/clients', icon: <DollarSign className="w-5 h-5" /> },
            { label: 'Ofertas', href: '/offers', icon: <Gift className="w-5 h-5" /> },
            { label: 'FAQ', href: '/faqs', icon: <HelpCircleIcon className="w-5 h-5" /> },
            { label: 'Investor Demo', href: '/investor-demo', icon: <DollarSign className="w-5 h-5 text-yellow-500" /> },
        ],
    },
]

const vendedorSections: SidebarSection[] = [
    {
        title: 'Controle',
        items: [
            { label: 'Controle', mobileLabel: 'Controle', href: '/controle', icon: <Gauge className="w-5 h-5" /> },
        ],
    },
    {
        title: 'Energia',
        items: [
            { label: 'Geração', href: '/dashboard', icon: <Home className="w-5 h-5" /> },
            { label: 'Minhas Usinas', href: '/plants/wizard', icon: <Zap className="w-5 h-5" /> },
        ],
    },
    {
        title: 'Consumo',
        items: [
            { label: 'Economia', href: '/economia', icon: <DollarSign className="w-5 h-5" /> },
            { label: 'Rateio', href: '/rateio', icon: <Percent className="w-5 h-5" /> },
            { label: 'Consumo', href: '/consumo/historico', icon: <Gauge className="w-5 h-5" /> },
        ],
    },
    {
        title: 'Solo Club',
        items: [
            { label: 'Clube Solo', href: '/club', icon: <Gift className="w-5 h-5" /> },
            { label: 'Meus Vouchers', href: '/vouchers', icon: <Ticket className="w-5 h-5" /> },
            { label: 'Solo Coins', href: '/solo-coins', icon: <Coins className="w-5 h-5" /> },
        ],
    },
    {
        items: [
            { label: 'Suporte', href: '/support', icon: <HelpCircleIcon className="w-5 h-5" /> },
        ],
    },
]

const vendedorMobileItems: SidebarItem[] = [
    { label: 'Controle', mobileLabel: 'Controle', href: '/controle', icon: <Gauge className="w-5 h-5" /> },
    { label: 'Energia', mobileLabel: 'Energia', href: '/energia', icon: <Zap className="w-5 h-5" /> },
    { label: 'Consumo', mobileLabel: 'Consumo', href: '/consumo', icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Solo Club', mobileLabel: 'Club', href: '/club', icon: <Gift className="w-5 h-5" /> },
    { label: 'Suporte', mobileLabel: 'Suporte', href: '/support', icon: <HelpCircleIcon className="w-5 h-5" /> },
]

export function AppSidebar() {
    const { user, logout } = useAuthContext();
    const isMobile = useIsMobile();
    const { resolvedTheme } = useTheme();

    const isMaster = user?.roles.includes("master");
    const role = isMaster ? 'admin' : 'vendedor';

    const sectionsMapper = {
        admin: adminSections,
        vendedor: vendedorSections,
    }

    const sections = sectionsMapper[role as keyof typeof sectionsMapper] || vendedorSections;
    const items = role === 'vendedor' ? vendedorMobileItems : undefined;

    // App is dark-first; brand wordmark reads on dark surfaces.
    const logoSrc = resolvedTheme === 'light' ? '/logo-black-text.png' : '/brand/wordmark-light.png';

    return (
        <Sidebar
            sections={sections}
            items={items}
            type={isMobile ? 'footer' : 'sidebar'}
            user={{ name: user?.name || 'User', role: role === 'admin' ? 'Admin' : 'Vendedor' }}
            onLogout={logout}
            logoSrc={logoSrc}
        />
    )
}