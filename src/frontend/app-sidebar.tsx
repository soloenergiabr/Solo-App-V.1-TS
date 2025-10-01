"use client"

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { useAuthContext } from "@/frontend/auth/contexts/auth-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { Home, Inbox, Calendar, Search, Settings, UserIcon } from "lucide-react"
import Link from "next/link"

const items = [
    {
        title: "Minha geração",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Meu perfil",
        url: "/profile",
        icon: UserIcon,
    },
]

export function AppSidebar() {
    const { user } = useAuthContext();
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <footer className="fixed bottom-0 left-0 right-0">
                <div className="flex items-center justify-between p-4">
                    <Link href="#">
                        <Home />
                    </Link>
                    <Link href="#">
                        <Inbox />
                    </Link>
                    <Link href="#">
                        <Calendar />
                    </Link>
                    <Link href="#">
                        <Search />
                    </Link>
                    <Link href="#">
                        <Settings />
                    </Link>
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