"use client"

import { Sidebar, SidebarSection } from "@/components/ui/sidebar"
import { useAuthContext } from "@/frontend/auth/contexts/auth-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { DollarSign, HelpCircleIcon, Home } from "lucide-react"
import Link from "next/link"

const adminSections: SidebarSection[] = [
    {
        title: 'Principal',
        items: [
            { label: 'Dashboard', href: '/dashboard', icon: <Home className="w-5 h-5" /> },
            { label: 'Clientes', href: '/clients', icon: <DollarSign className="w-5 h-5" /> },
        ],
    },
]

const vendedorSections: SidebarSection[] = [
    {
        title: 'Principal',
        items: [
            { label: 'Minha geração', href: '/dashboard', icon: <Home className="w-5 h-5" /> },
            { label: 'Economia', href: '/dashboard', icon: <DollarSign className="w-5 h-5" /> },
            { label: 'Clube Solo', href: '/club', icon: <DollarSign className="w-5 h-5" /> },
            { label: 'Suporte', href: '/support', icon: <HelpCircleIcon className="w-5 h-5" /> },
        ],
    },
]

export function AppSidebar() {
    const { user, logout } = useAuthContext();
    const isMobile = useIsMobile();

    const isMaster = user?.roles.includes("master");
    const role = isMaster ? 'admin' : 'vendedor';

    const sectionsMapper = {
        admin: adminSections,
        vendedor: vendedorSections,
    }

    const sections = sectionsMapper[role as keyof typeof sectionsMapper] || vendedorSections;
    const mobileItems = sections[0].items;

    if (isMobile) {
        return (
            <footer className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center justify-around px-4 py-2 safe-area-inset-bottom">
                    {mobileItems.map((item) => {
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex flex-col items-center justify-center gap-1 min-w-[64px] py-2 px-3 rounded-lg transition-colors hover:bg-accent"
                            >
                                <div className="h-5 w-5">
                                    {item.icon}
                                </div>
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </footer>
        )
    }

    return (
        <Sidebar
            sections={sections}
            type="sidebar"
            user={{ name: user?.name || 'User', role: role === 'admin' ? 'Admin' : 'Vendedor' }}
            onLogout={logout}
        />
    )
}