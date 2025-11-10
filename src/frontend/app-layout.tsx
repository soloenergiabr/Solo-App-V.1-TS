"use client"

import { AppSidebar } from "./app-sidebar"
import { useIsMobile } from "@/hooks/use-mobile"

export function AppLayout({ children }: { children: React.ReactNode }) {
    const isMobile = useIsMobile();
    return (
        <main className="flex flex-row max-w-screen overflow-x-hidden">
            <div className="max-w-sm w-full h-screen sticky top-0 hidden md:block">
                <AppSidebar />
            </div>
            <div className="w-full max-h-screen overflow-y-auto h-screen">
                {children}
            </div>
        </main>
    )
}