'use client';

import { withAuth } from '@/frontend/auth/contexts/auth-context';
import { useGenerationDashboard, type DashboardAnalytics } from '@/frontend/generation/hooks/use-generation-dashboard';
import { PeriodTabs } from '@/frontend/generation/components/dashboard/period-tabs';
import { InvertersTable } from '@/frontend/generation/components/dashboard/inverters-table';
import { InvertersComparisonChart } from '@/frontend/generation/components/dashboard/inverters-comparison-chart';
import { InverterMultiSelect } from '@/components/ui/inverter-multi-select';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Filter, Zap, Activity, TrendingUp, Database } from "lucide-react";
import { PageHeader, PageLayout } from '@/components/ui/page-layout';
import { EfficiencyGauge } from '@/frontend/generation/components/dashboard/efficiency-gauge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    MetricTile,
    GlowChart,
    LiveBadge,
    StatusRing,
    formatKwh,
    type TelemetryStatus,
} from '@/frontend/telemetry-kit';

const formatW = (value: number) =>
    `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value)} W`;

// Derive a telemetry status for each inverter from the data we already have:
// no readings → unknown; readings but no power → atenção; otherwise ok.
function inverterStatus(inv: DashboardAnalytics['byInverter'][number]): TelemetryStatus {
    if (!inv.dataPoints) return 'unknown';
    if (inv.totalPower <= 0 && inv.peakPower <= 0) return 'warning';
    return 'ok';
}

function GenerationDashboardPage() {
    const {
        analytics,
        isLoading,
        error,
        filters,
        updateFilters,
        refetch,
        goToPreviousPeriod,
        goToNextPeriod,
        goToToday,
        getCurrentPeriodLabel,
    } = useGenerationDashboard({});

    const handleInverterSelectionChange = (selectedIds: string[]) => {
        updateFilters({
            inverterIds: selectedIds.length > 0 ? selectedIds : undefined
        });
    };

    const isRealTime = filters.generationUnitType === 'real_time';

    const chartData = (analytics?.timeSeries ?? []).map((point) => ({
        label: format(new Date(point.timestamp), isRealTime ? 'HH:mm' : 'dd/MM', { locale: ptBR }),
        energia: point.energy,
    }));

    const efficiencyPct = analytics
        ? Math.min(100, Math.round((analytics.overview.averagePower / Math.max(1, analytics.overview.peakPower)) * 100))
        : 0;

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro ao carregar dashboard</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <PageLayout
            header={
                <PageHeader
                    title="Dashboard de Geração"
                    subtitle='Acompanhe em tempo real a geração de energia dos seu sistema'
                />
            }
        >
            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                    {/* Loading State */}
                    {isLoading && !analytics ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton key={i} className="h-24" />
                                ))}
                            </div>
                            <Skeleton className="h-10" />
                            <Skeleton className="h-[300px]" />
                        </div>
                    ) : analytics ? (
                        <>
                            {/* Indicador ao vivo */}
                            {isRealTime && (
                                <div className="flex justify-end">
                                    <LiveBadge label="tempo real" />
                                </div>
                            )}

                            {/* Métricas Compactas */}
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                                {isRealTime ? (
                                    <>
                                        <MetricTile
                                            label="POTÊNCIA ATUAL"
                                            value={formatW(analytics.overview.totalPower)}
                                            sublabel="agora"
                                            icon={<Activity className="size-4 text-primary" />}
                                        />
                                        <MetricTile
                                            label="GERAÇÃO HOJE"
                                            value={formatKwh(analytics.overview.totalEnergy)}
                                            sublabel="energia"
                                            icon={<Zap className="size-4 text-primary" />}
                                        />
                                        <MetricTile
                                            label="PICO DE POTÊNCIA"
                                            value={formatW(analytics.overview.peakPower)}
                                            sublabel="máximo"
                                            icon={<TrendingUp className="size-4 text-primary" />}
                                        />
                                        <MetricTile
                                            label="INVERSORES ATIVOS"
                                            value={`${analytics.overview.activeInverters} / ${analytics.overview.totalInverters}`}
                                            sublabel="online"
                                            icon={<Database className="size-4 text-primary" />}
                                        />
                                        <EfficiencyGauge percent={efficiencyPct} />
                                    </>
                                ) : (
                                    <>
                                        <MetricTile
                                            label="ENERGIA TOTAL"
                                            value={formatKwh(analytics.overview.totalEnergy)}
                                            sublabel="no período"
                                            icon={<Zap className="size-4 text-primary" />}
                                        />
                                        <MetricTile
                                            label="POTÊNCIA MÉDIA"
                                            value={formatW(analytics.overview.averagePower)}
                                            sublabel="média"
                                            icon={<Activity className="size-4 text-primary" />}
                                        />
                                        <MetricTile
                                            label="PICO DE POTÊNCIA"
                                            value={formatW(analytics.overview.peakPower)}
                                            sublabel="máximo"
                                            icon={<TrendingUp className="size-4 text-primary" />}
                                        />
                                        <MetricTile
                                            label="PONTOS DE DADOS"
                                            value={`${analytics.overview.totalDataPoints}`}
                                            sublabel="leituras"
                                            icon={<Database className="size-4 text-primary" />}
                                        />
                                    </>
                                )}
                            </div>

                            {/* Status dos inversores */}
                            {analytics.byInverter.length > 0 && (
                                <div className="flex flex-wrap gap-4 rounded-2xl border bg-card p-4">
                                    {analytics.byInverter.map((inv) => (
                                        <StatusRing
                                            key={inv.inverterId}
                                            label={inv.inverterName}
                                            status={inverterStatus(inv)}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Tabs de Período */}
                            <PeriodTabs
                                filters={filters}
                                currentPeriodLabel={getCurrentPeriodLabel()}
                                onUpdateFilters={updateFilters}
                                onPreviousPeriod={goToPreviousPeriod}
                                onNextPeriod={goToNextPeriod}
                                onToday={goToToday}
                                onRefresh={refetch}
                                isLoading={isLoading}
                            />

                            {/* Filtro de Inversores */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Filter className="h-4 w-4" />
                                    <span>Filtrar por inversor:</span>
                                </div>
                                <InverterMultiSelect
                                    selectedIds={filters.inverterIds || []}
                                    onSelectionChange={handleInverterSelectionChange}
                                    placeholder="Todos os inversores"
                                />
                            </div>

                            {/* Gráfico Principal */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-display text-lg font-semibold text-foreground">
                                        {isRealTime ? 'Geração em Tempo Real' : 'Geração de Energia'}
                                    </h2>
                                    {isRealTime && <LiveBadge />}
                                </div>
                                <GlowChart data={chartData} dataKey="energia" xKey="label" />
                            </div>

                            {/* Gráfico de Comparação de Inversores */}
                            {analytics.byInverter.length > 1 && (
                                <InvertersComparisonChart analytics={analytics} />
                            )}

                            {/* Tabela de Inversores */}
                            <InvertersTable analytics={analytics} />

                            {/* Footer Compacto */}
                            <div className="text-xs text-center text-muted-foreground py-2">
                                Última atualização: {new Date().toLocaleTimeString('pt-BR')}
                            </div>
                        </>
                    ) : (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Nenhum dado disponível</AlertTitle>
                            <AlertDescription>
                                Não há dados de geração para exibir no momento.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
        </PageLayout>
    );
}

export default withAuth(GenerationDashboardPage);

