"use client"

import { AppSidebar } from "./app-sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { HelpButton } from "@/frontend/support/components/help-button"

export function AppLayout({ children }: { children: React.ReactNode }) {
    const isMobile = useIsMobile();

    // A página fica sempre na mesma posição da árvore: useIsMobile vira true
    // depois do primeiro render, e trocar de árvore remontava a página no meio
    // de um redirect ("Rendered more hooks than during the previous render").
    return (
        <main className={isMobile ? "flex flex-col min-h-screen w-full" : "flex flex-row max-w-screen overflow-x-hidden"}>
            {!isMobile && (
                <div className="w-64 shrink-0 h-screen sticky top-0 print:hidden">
                    <AppSidebar />
                </div>
            )}
            <div
                className={
                    isMobile
                        ? "flex-1 overflow-y-auto pb-16 print:overflow-visible print:pb-0"
                        : "w-full max-h-screen overflow-y-auto h-screen print:h-auto print:max-h-none print:overflow-visible"
                }
            >
                {children}
            </div>
            <div className="print:hidden">
                {isMobile && <AppSidebar />}
                <HelpButton />
            </div>
        </main>
    )
}
