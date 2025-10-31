"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { useIsMobile } from "@/hooks/use-mobile"

export function AppLayout({ children }: { children: React.ReactNode }) {
    const isMobile = useIsMobile();
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className={`w-full h-screen ${isMobile ? 'pb-16' : ''}`}>
                {/* {!isMobile && <SidebarTrigger />} */}
                {children}
            </main>

        </SidebarProvider>
    )
}