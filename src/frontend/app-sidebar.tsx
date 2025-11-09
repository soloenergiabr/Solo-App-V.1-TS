"use client"

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { useAuthContext } from "@/frontend/auth/contexts/auth-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { DollarSign, HelpCircleIcon, Home, UserIcon } from "lucide-react"
import Link from "next/link"

const masterItems = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Clientes",
        url: "/clients",
        icon: DollarSign,
    },
]

const userItems = [
    {
        title: "Minha geração",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Economia",
        url: "/dashboard/economy",
        icon: DollarSign,
    },
    {
        title: "Clube Solo",
        url: "/club",
        icon: DollarSign,
    },
    {
        title: "Suporte",
        url: "/support",
        icon: HelpCircleIcon,
    },
]

export function AppSidebar() {
    const { user } = useAuthContext();
    const isMobile = useIsMobile();

    const isMaster = user?.roles.includes("master");

    const items = isMaster ? masterItems : userItems;

    if (isMobile) {
        return (
            <footer className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center justify-around px-4 py-2 safe-area-inset-bottom">
                    {items.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.url}
                                href={item.url}
                                className="flex flex-col items-center justify-center gap-1 min-w-[64px] py-2 px-3 rounded-lg transition-colors hover:bg-accent"
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-[10px] font-medium">{item.title}</span>
                            </Link>
                        );
                    })}
                </div>
            </footer>
        )
    }

    return (
        <Sidebar>
            {/* <SidebarHeader>
                <SidebarGroup />
                {user && (
                    <h1>{user.name}</h1>
                )}
            </SidebarHeader> */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Geral</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter />
        </Sidebar>
    )
}