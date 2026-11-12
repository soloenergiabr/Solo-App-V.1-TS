"use client"

import { Sidebar, SidebarItem, SidebarSection } from "@/components/ui/sidebar"
import { useAuthContext } from "@/frontend/auth/contexts/auth-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { ClipboardCheck, Coins, DollarSign, FileCheck, Gauge, Gift, HelpCircleIcon, Home, Percent, Ticket, Users, Zap, Receipt, ShieldCheck, UserCog } from "lucide-react"
import { useTheme } from "next-themes"
import { useAdminApprovals } from "@/frontend/admin/hooks/use-admin-approvals"

// Admin: o dia a dia (clientes e pendencias) em cima; integracoes e clube depois.
const buildAdminSections = (pendingCount: number): SidebarSection[] => [
    {
        title: 'Principal',
        items: [
            { label: 'Dashboard', href: '/dashboard', icon: <Home className="w-5 h-5" /> },
            { label: 'Clientes', href: '/clients', icon: <Users className="w-5 h-5" /> },
        ],
    },
    {
        title: 'Pendências',
        items: [
            {
                label: pendingCount > 0 ? `Aprovações (${pendingCount})` : 'Aprovações',
                href: '/admin/approvals',
                icon: <ClipboardCheck className="w-5 h-5" />,
            },
            { label: 'Validação de faturas', href: '/admin/bills/validation', icon: <FileCheck className="w-5 h-5" /> },
        ],
    },
    {
        title: 'Integrações',
        items: [
            { label: 'Busca de faturas (Faturapi)', href: '/admin/faturapi', icon: <Receipt className="w-5 h-5" /> },
        ],
    },
    {
        title: 'Clube e suporte',
        items: [
            { label: 'Ofertas do clube', href: '/offers', icon: <Gift className="w-5 h-5" /> },
            { label: 'FAQ', href: '/faqs', icon: <HelpCircleIcon className="w-5 h-5" /> },
        ],
    },
    {
        title: 'Configurações',
        items: [
            { label: 'Equipe e permissões', href: '/admin/team', icon: <ShieldCheck className="w-5 h-5" /> },
            { label: 'Minha conta', href: '/admin/account', icon: <UserCog className="w-5 h-5" /> },
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
            { label: 'Economia', href: '/consumo?tab=economia', icon: <DollarSign className="w-5 h-5" /> },
            { label: 'Rateio', href: '/consumo?tab=rateio', icon: <Percent className="w-5 h-5" /> },
            { label: 'Histórico', href: '/consumo?tab=historico', icon: <Gauge className="w-5 h-5" /> },
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
    { label: 'Solo Club', mobileLabel: 'Club', href: '/solo-club', icon: <Gift className="w-5 h-5" /> },
    { label: 'Suporte', mobileLabel: 'Suporte', href: '/support', icon: <HelpCircleIcon className="w-5 h-5" /> },
]

export function AppSidebar() {
    const { user, logout } = useAuthContext();
    const isMobile = useIsMobile();
    const { resolvedTheme } = useTheme();

    const { data: pendingCount = 0 } = useAdminApprovals({
        select: (items) => items.length,
        enabled: user?.roles.includes('master') ?? false,
    });

    const isMaster = user?.roles.includes("master");
    const role = isMaster ? 'admin' : 'vendedor';

    const adminSections = buildAdminSections(pendingCount);

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
