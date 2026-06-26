"use client"

import Link from "next/link"
import { Home, Zap } from "lucide-react"
import { PageLayout, PageHeader } from "@/components/ui/page-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const navCards = [
    {
        title: "Geração",
        description: "Acompanhe a energia que suas usinas geraram.",
        href: "/dashboard",
        icon: <Zap className="w-6 h-6 text-primary" />,
    },
    {
        title: "Minhas Usinas",
        description: "Veja e cadastre suas usinas solares.",
        href: "/plants/wizard",
        icon: <Home className="w-6 h-6 text-primary" />,
    },
]

export function EnergiaHub() {
    return (
        <PageLayout
            header={
                <PageHeader
                    title="Energia"
                    subtitle="Sua geração e suas usinas em um só lugar"
                />
            }
        >
            <div className="grid gap-4 sm:grid-cols-2">
                {navCards.map((card) => (
                    <Link
                        key={card.href}
                        href={card.href}
                        className="rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <Card className="h-full cursor-pointer hover:bg-primary/10 transition-colors">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    {card.icon}
                                    <CardTitle className="text-lg">{card.title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>{card.description}</CardDescription>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </PageLayout>
    )
}
