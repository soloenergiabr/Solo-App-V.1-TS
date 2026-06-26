'use client'

import Link from 'next/link'
import { DollarSign, Percent, Gauge } from 'lucide-react'
import { PageLayout, PageHeader } from '@/components/ui/page-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useEconomia } from '@/frontend/economia/hooks/use-economia'
import { AnalyzeBillDialog } from '@/frontend/economia/components/analyze-bill-dialog'

export function ConsumoHub() {
    const { bills, refetch } = useEconomia({ year: new Date().getFullYear() })

    const economiaDescription =
        bills !== null && bills.length === 0
            ? 'Ainda não analisamos nenhuma conta sua. Envie o PDF da sua conta de luz e a IA cuida do resto.'
            : bills && bills.length > 0
              ? `Veja a análise das suas contas de luz. ${bills.length} conta(s) analisada(s).`
              : 'Veja a análise das suas contas de luz.'

    const navCards = [
        {
            title: 'Economia',
            description: economiaDescription,
            href: '/economia',
            icon: <DollarSign className="w-6 h-6 text-primary" />,
        },
        {
            title: 'Rateio',
            description: 'Como sua energia é distribuída entre as unidades.',
            href: '/rateio',
            icon: <Percent className="w-6 h-6 text-primary" />,
        },
        {
            title: 'Histórico de consumo',
            description: 'Acompanhe seu consumo mês a mês.',
            href: '/consumo/historico',
            icon: <Gauge className="w-6 h-6 text-primary" />,
        },
    ]

    return (
        <PageLayout
            header={
                <PageHeader
                    title="Consumo"
                    subtitle="Suas contas, rateio e consumo em um só lugar"
                    actions={
                        <div className="flex flex-col items-end gap-1">
                            <AnalyzeBillDialog onSuccess={refetch} />
                            <p className="text-xs text-muted-foreground">
                                Tem o PDF da conta? Use &ldquo;Analisar conta&rdquo; para a IA preencher tudo.
                            </p>
                        </div>
                    }
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
