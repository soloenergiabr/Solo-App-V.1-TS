"use client"

import Link from "next/link"
import { Gift, Ticket, Coins } from "lucide-react"
import { PageLayout, PageHeader } from "@/components/ui/page-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const navCards = [
    {
        title: "Clube Solo",
        description: "Vantagens e benefícios do seu clube.",
        href: "/club",
        icon: <Gift className="w-6 h-6 text-primary" />,
    },
    {
        title: "Meus Vouchers",
        description: "Seus vouchers e recompensas resgatadas.",
        href: "/vouchers",
        icon: <Ticket className="w-6 h-6 text-primary" />,
    },
    {
        title: "Solo Coins",
        description: "Acompanhe e use seus Solo Coins.",
        href: "/solo-coins",
        icon: <Coins className="w-6 h-6 text-primary" />,
    },
]

export function SoloClubHub() {
    return (
        <PageLayout
            header={
                <PageHeader
                    title="Solo Club"
                    subtitle="Suas recompensas, vouchers e Solo Coins em um só lugar"
                />
            }
        >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
