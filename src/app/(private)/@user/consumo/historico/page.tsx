'use client'

import { ConsumptionDashboard } from "@/frontend/consumption/components/consumption-dashboard"
import { useAuth } from "@/frontend/auth/hooks/useAuth"
import { PageLayout, PageHeader } from "@/components/ui/page-layout"
import { Loader2 } from "lucide-react"

export default function ConsumoHistoricoPage() {
    const { user } = useAuth()

    if (!user || !user.clientId) {
        return (
            <PageLayout
                header={
                    <PageHeader
                        title="Histórico de consumo"
                        subtitle="Acompanhe seu consumo mês a mês"
                    />
                }
            >
                <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            </PageLayout>
        )
    }

    return <ConsumptionDashboard clientId={user.clientId} />
}
