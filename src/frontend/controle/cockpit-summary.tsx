'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Receipt, Zap, Split, DollarSign } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi'

interface CockpitSummaryData {
    pendingBills: number
    activePlants: number
    pendingRateios: number
    totalSavings: number
}

function formatBRL(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value)
}

interface SummaryTileProps {
    icon: React.ReactNode
    label: string
    value: string
    href: string
    accentClass: string
}

function SummaryTile({ icon, label, value, href, accentClass }: SummaryTileProps) {
    return (
        <Link href={href} className="block">
            <Card className="cursor-pointer transition-colors hover:bg-card/80">
                <CardContent className="flex items-center gap-4 p-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accentClass}`}>
                        {icon}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-medium tracking-wide text-muted-foreground">
                            {label}
                        </span>
                        <span className="font-display text-xl font-semibold text-foreground">
                            {value}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

export function CockpitSummary() {
    const api = useAuthenticatedApi()
    const [data, setData] = useState<CockpitSummaryData | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!api.isAuthenticated) return
        setIsLoading(true)
        api.get('/controle/summary')
            .then((res) => {
                if (res.data.success) setData(res.data.data)
                else setError(res.data.message || 'Falha ao carregar resumo')
            })
            .catch((e) => setError(e?.response?.data?.message || 'Erro ao carregar resumo'))
            .finally(() => setIsLoading(false))
    }, [api.isAuthenticated])

    if (error) {
        // Subtle error: just don't render anything rather than showing a destructive alert
        return null
    }

    if (isLoading || !data) {
        return (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="flex items-center gap-4 p-4">
                            <Skeleton className="h-10 w-10 rounded-xl" />
                            <div className="flex flex-col gap-1.5">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-5 w-12" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    const tiles = [
        {
            icon: <Receipt className="h-5 w-5" />,
            label: 'Faturas Pendentes',
            value: String(data.pendingBills),
            href: '/economia',
            accentClass: data.pendingBills > 0
                ? 'bg-amber-500/15 text-amber-500'
                : 'bg-emerald-500/15 text-emerald-500',
        },
        {
            icon: <Zap className="h-5 w-5" />,
            label: 'Usinas Ativas',
            value: String(data.activePlants),
            href: '/plants/wizard',
            accentClass: 'bg-primary/15 text-primary',
        },
        {
            icon: <Split className="h-5 w-5" />,
            label: 'Rateios Pendentes',
            value: String(data.pendingRateios),
            href: '/rateio',
            accentClass: data.pendingRateios > 0
                ? 'bg-amber-500/15 text-amber-500'
                : 'bg-emerald-500/15 text-emerald-500',
        },
        {
            icon: <DollarSign className="h-5 w-5" />,
            label: 'Economia Total',
            value: formatBRL(data.totalSavings),
            href: '/controle',
            accentClass: 'bg-sky-500/15 text-sky-500',
        },
    ]

    return (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {tiles.map((tile) => (
                <SummaryTile key={tile.label} {...tile} />
            ))}
        </div>
    )
}
