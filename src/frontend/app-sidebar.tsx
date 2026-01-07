"use client"

import { Sidebar, SidebarSection } from "@/components/ui/sidebar"
import { useAuthContext } from "@/frontend/auth/contexts/auth-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { DollarSign, HelpCircleIcon, Home, Menu } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

const adminSections: SidebarSection[] = [
    {
        title: 'Principal',
        items: [
            { label: 'Dashboard', href: '/dashboard', icon: <Home className="w-5 h-5" /> },
            { label: 'Clientes', href: '/clients', icon: <DollarSign className="w-5 h-5" /> },
            { label: 'Ofertas', href: '/offers', icon: <DollarSign className="w-5 h-5" /> },
            { label: 'FAQ', href: '/faqs', icon: <HelpCircleIcon className="w-5 h-5" /> },
        ],
    },
]

const vendedorSections: SidebarSection[] = [
    {
        title: 'Principal',
        items: [
            { label: 'Minha geração', href: '/dashboard', icon: <Home className="w-5 h-5" /> },
            { label: 'Economia', href: '/economy-dashboard', icon: <DollarSign className="w-5 h-5" /> },
            { label: 'Clube Solo', href: '/club', icon: <DollarSign className="w-5 h-5" /> },
            { label: 'Suporte', href: '/support', icon: <HelpCircleIcon className="w-5 h-5" /> },
        ],
    },
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

    const logoSrc = resolvedTheme === 'dark' ? '/logo-white-text.png' : '/logo-black-text.png';

    return (
        <Sidebar
            sections={sections}
            type={isMobile ? 'footer' : 'sidebar'}
            user={{ name: user?.name || 'User', role: role === 'admin' ? 'Admin' : 'Vendedor' }}
            onLogout={logout}
            logoSrc={logoSrc}
        />
    )
}