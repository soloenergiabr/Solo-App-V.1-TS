"use client"

import { AppSidebar } from "./app-sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { HelpButton } from "@/frontend/support/components/help-button"

export function AppLayout({ children }: { children: React.ReactNode }) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <main className="flex flex-col min-h-screen w-full">
                <div className="flex-1 overflow-y-auto pb-16 print:overflow-visible print:pb-0">
                    {children}
                </div>
                <div className="print:hidden">
                    <AppSidebar />
                    <HelpButton />
                </div>
            </main>
        )
    }

    return (
        <main className="flex flex-row max-w-screen overflow-x-hidden">
            <div className="w-64 shrink-0 h-screen sticky top-0 print:hidden">
                <AppSidebar />
            </div>
            <div className="w-full max-h-screen overflow-y-auto h-screen print:h-auto print:max-h-none print:overflow-visible">
                {children}
            </div>
            <div className="print:hidden">
                <HelpButton />
            </div>
        </main>
    )
}