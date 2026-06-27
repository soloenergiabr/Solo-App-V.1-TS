'use client'

import { useEffect, useState } from 'react'
import { useEconomia } from './hooks/use-economia'
import { aggregateEconomy } from './lib/aggregate'
import { ContasAPagar } from './components/contas-a-pagar'
import { AccountCard } from './components/account-card'
import { RateioBar } from './components/rateio-bar'
import { ConsolidadoSummary } from './components/consolidado-summary'
import { CostBreakdown } from './components/cost-breakdown'
import { AddBillForm } from './components/add-bill-form'
import { AddGenerationForm } from './components/add-generation-form'
import { AnalyzeBillDialog } from './components/analyze-bill-dialog'
import { PageLayout, PageHeader, PageEmpty } from '@/components/ui/page-layout'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi'
import type { AccountBill, RateioSlice } from '@/shared/controle/types'

type Tab = 'consolidado' | 'por-conta'

interface EconomiaScreenProps {
    embedded?: boolean
}

export function EconomiaScreen({ embedded }: EconomiaScreenProps) {
    const currentYear = new Date().getFullYear()
    const [year] = useState(currentYear)
    const [tab, setTab] = useState<Tab>('consolidado')
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const { bills, isLoading, error, refetch } = useEconomia({ year })

    const api = useAuthenticatedApi()
    const [rateioSlices, setRateioSlices] = useState<RateioSlice[]>([])

    useEffect(() => {
        if (!api.isAuthenticated) return
        api.get('/rateio')
            .then((res) => {
                if (!res.data.success) return
                const allocations = res.data.data as any[]
                const slices: RateioSlice[] = allocations
                    .filter((a: any) => a.isActive && a.enelSyncStatus !== 'draft')
                    .map((a: any) => ({
                        toUnitId: a.toId,
                        toUnitName: a.to?.name ?? a.toId,
                        percentage: Number(a.allocationPercentage),
                    }))
                setRateioSlices(slices)
            })
            .catch(() => {
                // non-critical, silently ignore
            })
    }, [api.isAuthenticated])

    const consolidated = aggregateEconomy(bills ?? [])
    const selected: AccountBill | undefined =
        selectedId != null ? (bills ?? []).find((b) => b.id === selectedId) : undefined

    const actions = (
        <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-lg border bg-card p-0.5 text-sm">
                    <button
                        onClick={() => setTab('consolidado')}
                        className={
                            'rounded-md px-3 py-1 transition-colors ' +
                            (tab === 'consolidado'
                                ? 'bg-primary text-primary-foreground font-medium'
                                : 'text-muted-foreground hover:text-foreground')
                        }
                    >
                        Consolidado
                    </button>
                    <button
                        onClick={() => setTab('por-conta')}
                        className={
                            'rounded-md px-3 py-1 transition-colors ' +
                            (tab === 'por-conta'
                                ? 'bg-primary text-primary-foreground font-medium'
                                : 'text-muted-foreground hover:text-foreground')
                        }
                    >
                        Por conta
                    </button>
                </div>
                <AddBillForm onSuccess={refetch} />
                <AnalyzeBillDialog onSuccess={refetch} />
                <AddGenerationForm onSuccess={refetch} />
            </div>
            <p className="text-xs text-muted-foreground">
                Tem o PDF da conta? Use &ldquo;Analisar conta&rdquo; para a IA preencher tudo.
            </p>
        </div>
    )

    const body = (
        <>
            {/* Loading state */}
            {isLoading && (
                <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            )}

            {/* Error state */}
            {!isLoading && error && (
                <Alert variant="destructive">
                    <AlertTitle>Erro ao carregar faturas</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Empty state */}
            {!isLoading && !error && bills !== null && bills.length === 0 && (
                <PageEmpty
                    title="Nenhuma conta ainda"
                    description="As faturas do período aparecerão aqui assim que forem registradas."
                />
            )}

            {/* Content */}
            {!isLoading && !error && bills && bills.length > 0 && (
                <div className="space-y-4">
                    {/* Contas a pagar — always visible */}
                    <ContasAPagar bills={bills} />

                    {tab === 'consolidado' && (
                        <div className="space-y-3">
                            <ConsolidadoSummary data={consolidated} />
                            {/* Wire rateio slices from credit-allocations */}
                            <RateioBar slices={rateioSlices} />
                        </div>
                    )}

                    {tab === 'por-conta' && (
                        <div className="space-y-4">
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {bills.map((b) => (
                                    <button
                                        key={b.id}
                                        type="button"
                                        onClick={() =>
                                            setSelectedId((prev) => (prev === b.id ? null : b.id))
                                        }
                                        className={
                                            'text-left rounded-2xl transition-shadow ' +
                                            (selectedId === b.id
                                                ? 'ring-2 ring-primary'
                                                : 'hover:ring-1 hover:ring-border')
                                        }
                                    >
                                        <AccountCard bill={b} />
                                    </button>
                                ))}
                            </div>

                            {selected && (
                                <CostBreakdown bill={selected} />
                            )}
                        </div>
                    )}
                </div>
            )}
        </>
    )

    if (embedded) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-end gap-2">{actions}</div>
                {body}
            </div>
        )
    }

    return (
        <PageLayout header={<PageHeader title="Economia" subtitle={String(year)} actions={actions} />}>
            {body}
        </PageLayout>
    )
}
