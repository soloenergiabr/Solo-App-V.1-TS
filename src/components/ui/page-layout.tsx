"use client"

export function PageLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <header>
                <h1>Dashboard</h1>
            </header>
            {children}
        </div>
    )
}