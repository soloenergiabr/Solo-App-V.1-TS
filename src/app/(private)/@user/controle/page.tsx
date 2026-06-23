'use client';

import { withAuth } from '@/frontend/auth/contexts/auth-context';
import { useControleOverview } from '@/frontend/controle/hooks/use-controle-overview';
import { CockpitSummary } from '@/frontend/controle/cockpit-summary';
import { OnboardingChecklist } from '@/frontend/controle/components/onboarding-checklist';
import { LifetimeStrip } from '@/frontend/controle/components/lifetime-strip';
import { PageHeader, PageLayout } from '@/components/ui/page-layout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Zap } from 'lucide-react';
import Link from 'next/link';
import {
    PaybackGauge,
    MetricTile,
    StatusRing,
    GlowChart,
    LiveBadge,
    formatBRL,
    formatKwh,
    formatKw,
    type TelemetryStatus,
} from '@/frontend/telemetry-kit';

function ControlePage() {
    const { overview, isLoading, error } = useControleOverview();

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro ao carregar Controle</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <PageLayout
            header={
                <PageHeader
                    title="Controle"
                    subtitle="Visão geral do seu sistema solar"
                />
            }
        >
            <div className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                    {/* Onboarding Checklist + Pending Banner */}
                    <OnboardingChecklist />

                    {/* Cockpit Summary */}
                    <CockpitSummary />

                    {/* Loading State */}
                    {isLoading && !overview ? (
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-48" />
                            <div className="grid grid-cols-3 gap-3">
                                {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} className="h-24" />
                                ))}
                            </div>
                            <Skeleton className="h-24" />
                            <Skeleton className="h-24" />
                            <Skeleton className="h-32" />
                        </div>
                    ) : overview ? (
                        <>
                            {/* Header: LiveBadge + period label */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Este mês</span>
                                <LiveBadge label="ao vivo" />
                            </div>

                            {/* PaybackGauge hero */}
                            <PaybackGauge
                                totalInvested={overview.investment.totalInvested}
                                returned={overview.investment.returned}
                                payoffLabel={overview.investment.expectedPayoffLabel ?? undefined}
                            />

                            {/* 3-tile MetricTile row */}
                            <div className="grid grid-cols-3 gap-3">
                                <MetricTile
                                    label="DINHEIRO"
                                    value={formatBRL(overview.month.moneySaved)}
                                    sublabel="economizado"
                                />
                                <MetricTile
                                    label="ENERGIA"
                                    value={formatKwh(overview.month.energyGeneratedKwh)}
                                    sublabel="gerada"
                                />
                                <MetricTile
                                    label="RETORNO"
                                    value={formatBRL(overview.month.returnVsInvestment)}
                                    sublabel={`+${overview.month.monthChangePercent}%`}
                                />
                            </div>

                            {/* LifetimeStrip */}
                            <LifetimeStrip
                                totalGeneratedKwh={overview.lifetime.totalGeneratedKwh}
                                totalReturn={overview.lifetime.totalReturn}
                                monthsActive={overview.lifetime.monthsActive}
                                co2AvoidedTons={overview.lifetime.co2AvoidedTons}
                            />

                            {/* Per-account StatusRing strip */}
                            {overview.accounts.length > 0 && (
                                <div className="flex flex-wrap gap-4 rounded-2xl border bg-card p-4">
                                    {overview.accounts.map((account) => (
                                        <StatusRing
                                            key={account.id}
                                            label={account.name}
                                            status={account.status as TelemetryStatus}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Live generation peek card */}
                            <Link href="/dashboard" className="block">
                                <div className="flex items-center justify-between rounded-2xl border bg-card p-4 hover:bg-card/80 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Zap className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="text-xs font-medium tracking-wide text-muted-foreground">GERAÇÃO AGORA</p>
                                            <p className="font-display text-2xl font-semibold text-foreground">
                                                {formatKw(overview.liveGenerationKw)}
                                            </p>
                                        </div>
                                    </div>
                                    <GlowChart
                                        data={[{ t: '1', kw: overview.liveGenerationKw }]}
                                        dataKey="kw"
                                        xKey="t"
                                        height={80}
                                        className="w-32"
                                    />
                                </div>
                            </Link>
                        </>
                    ) : (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Nenhum dado disponível</AlertTitle>
                            <AlertDescription>
                                Não há dados de Controle para exibir no momento.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
        </PageLayout>
    );
}

export default withAuth(ControlePage);
