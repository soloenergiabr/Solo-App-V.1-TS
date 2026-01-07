"use client"

import { AppSidebar } from "./app-sidebar"
import { useIsMobile } from "@/hooks/use-mobile"

export function AppLayout({ children }: { children: React.ReactNode }) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <main className="flex flex-col min-h-screen w-full">
                <div className="flex-1 overflow-y-auto pb-16">
                    {children}
                </div>
                <AppSidebar />
            </main>
        )
    }

    return (
        <main className="flex flex-row max-w-screen overflow-x-hidden">
            <div className="max-w-sm w-full h-screen sticky top-0">
                <AppSidebar />
            </div>
            <div className="w-full max-h-screen overflow-y-auto h-screen">
                {children}
            </div>
        </main>
    )
}