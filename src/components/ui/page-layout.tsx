"use client"

export function PageLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            {/* <header>
                <h1>Dashboard</h1>
            </header> */}
            <main className="p-4">
                {children}
            </main>
        </div>
    )
}