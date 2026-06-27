'use client'

import { useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/frontend/auth/hooks/useAuth'
import { useEconomia } from '@/frontend/economia/hooks/use-economia'
import { EconomiaScreen } from '@/frontend/economia/economia-screen'
import { RateioScreen } from '@/frontend/rateio/rateio-screen'
import { ConsumptionDashboard } from '@/frontend/consumption/components/consumption-dashboard'
import { AnalyzeBillDialog } from '@/frontend/economia/components/analyze-bill-dialog'
import { PageLayout, PageHeader } from '@/components/ui/page-layout'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

function Loader() {
    return (
        <div className="flex items-center justify-center h-full min-h-[400px]" data-testid="loader">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
    )
}

const VALID_TABS = ['economia', 'rateio', 'historico'] as const
type Tab = (typeof VALID_TABS)[number]

function isTab(value: string | null): value is Tab {
    return VALID_TABS.includes(value as Tab)
}

export function ConsumoScreen() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { user, isLoading: authLoading } = useAuth()
    const { refetch } = useEconomia({ year: new Date().getFullYear() })

    const tabParam = searchParams.get('tab')
    const activeTab: Tab = isTab(tabParam) ? tabParam : 'economia'

    const handleTabChange = useCallback(
        (value: string) => {
            router.replace('/consumo?tab=' + value)
        },
        [router],
    )

    // Auth guard: wait for auth to load and clientId presence
    if (authLoading || !user?.clientId) {
        return (
            <PageLayout
                header={
                    <PageHeader
                        title="Consumo"
                        subtitle="Suas contas, rateio e consumo em um só lugar"
                    />
                }
            >
                <Loader />
            </PageLayout>
        )
    }

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
                                Tem o PDF da conta? Use &ldquo;Analisar conta&rdquo; para a IA
                                preencher tudo.
                            </p>
                        </div>
                    }
                />
            }
        >
            <Tabs value={activeTab} onValueChange={handleTabChange}>
                <div className="w-full overflow-x-auto">
                    <TabsList>
                        <TabsTrigger value="economia">Economia</TabsTrigger>
                        <TabsTrigger value="rateio">Rateio</TabsTrigger>
                        <TabsTrigger value="historico">Histórico</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="economia">
                    <EconomiaScreen embedded />
                </TabsContent>

                <TabsContent value="rateio">
                    <RateioScreen embedded />
                </TabsContent>

                <TabsContent value="historico">
                    <ConsumptionDashboard clientId={user.clientId} embedded />
                </TabsContent>
            </Tabs>
        </PageLayout>
    )
}
