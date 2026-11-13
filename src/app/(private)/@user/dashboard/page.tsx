'use client';

import { withAuth } from '@/frontend/auth/contexts/auth-context';
import { chartLabel, useGenerationDashboard, type DashboardAnalytics, type DashboardFilters } from '@/frontend/generation/hooks/use-generation-dashboard';
import { PeriodTabs } from '@/frontend/generation/components/dashboard/period-tabs';
import { InvertersTable } from '@/frontend/generation/components/dashboard/inverters-table';
import { InvertersComparisonChart } from '@/frontend/generation/components/dashboard/inverters-comparison-chart';
import { InverterMultiSelect } from '@/components/ui/inverter-multi-select';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Filter, Zap, Activity, TrendingUp, Database } from "lucide-react";
import { PageHeader, PageLayout } from '@/components/ui/page-layout';
import { EfficiencyGauge } from '@/frontend/generation/components/dashboard/efficiency-gauge';
import { ExportMenu, downloadCsv } from '@/frontend/lib/export';
import { format } from 'date-fns';
import {
    MetricTile,
    GlowChart,
    LiveBadge,
    StatusRing,
    formatKwh,
    formatPercent,
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

type PeriodType = NonNullable<DashboardFilters['generationUnitType']>;

const PERIOD_TEXT: Record<PeriodType, { current: string; previous?: string }> = {
    real_time: { current: 'Hoje', previous: 'ontem' },
    week: { current: 'Nesta semana', previous: 'na semana anterior' },
    day: { current: 'Neste mês', previous: 'no mês anterior' },
    month: { current: 'Neste ano', previous: 'no ano anterior' },
    year: { current: 'Desde o início' },
};

// Frase simples que explica o período escolhido, com a comparação que o backend já calcula.
function periodSummary(type: PeriodType, analytics: DashboardAnalytics): string {
    const text = PERIOD_TEXT[type];
    const base = `${text.current}, seu sistema gerou ${formatKwh(analytics.overview.totalEnergy)}`;
    const previous = analytics.comparison?.previousPeriod?.totalEnergy ?? 0;
    const change = analytics.comparison?.percentageChange?.energy;
    if (!text.previous || previous <= 0 || change == null) return `${base}.`;
    if (Math.abs(change) < 1) return `${base}, praticamente o mesmo que ${text.previous}.`;
    return `${base}, ${formatPercent(Math.abs(change))} a ${change > 0 ? 'mais' : 'menos'} que ${text.previous}.`;
}

function GenerationDashboardPage() {
    const {
        analytics,
        isLoading,
        error,
        syncError,
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

    const periodType: PeriodType = filters.generationUnitType ?? 'real_time';
    const isRealTime = periodType === 'real_time';
    const isWeek = periodType === 'week';

    const chartData = (analytics?.timeSeries ?? []).map((point) => ({
        label: chartLabel(point.timestamp, periodType),
        energia: point.energy,
    }));

    // CSV com a mesma série do gráfico (filtrada pelos inversores escolhidos).
    const exportCsv = () => {
        if (!analytics) return;
        const dateFormat = isRealTime ? 'dd/MM/yyyy HH:mm' : periodType === 'month' || periodType === 'year' ? 'MM/yyyy' : 'dd/MM/yyyy';
        const inverters = filters.inverterIds?.length
            ? analytics.byInverter.map((inv) => inv.inverterName).join(', ')
            : null;
        const columns = [isRealTime ? 'Data e hora' : 'Data', 'Energia (kWh)'];
        if (isRealTime) columns.push('Potência (W)');
        if (inverters) columns.push('Inversores');
        const rows = analytics.timeSeries.map((point) => {
            const row: (string | number)[] = [format(new Date(point.timestamp), dateFormat), point.energy];
            if (isRealTime) row.push(point.power);
            if (inverters) row.push(inverters);
            return row;
        });
        downloadCsv(`geracao-${periodType}-${format(filters.currentDate ?? new Date(), 'yyyy-MM-dd')}`, columns, rows);
    };

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
                    subtitle='Acompanhe em tempo real a geração de energia do seu sistema'
                    actions={<ExportMenu onCsv={exportCsv} disabled={!analytics} />}
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
                            {syncError && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Atenção na sincronização</AlertTitle>
                                    <AlertDescription>{syncError}</AlertDescription>
                                </Alert>
                            )}

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
                                            sublabel="Quanto os painéis produzem neste momento"
                                            icon={<Activity className="size-4 text-primary" />}
                                        />
                                        <MetricTile
                                            label="GERAÇÃO HOJE"
                                            value={formatKwh(analytics.overview.totalEnergy)}
                                            sublabel="Energia produzida desde o amanhecer"
                                            icon={<Zap className="size-4 text-primary" />}
                                        />
                                        <MetricTile
                                            label="PICO DE POTÊNCIA"
                                            value={formatW(analytics.overview.peakPower)}
                                            sublabel="Maior potência registrada no período"
                                            icon={<TrendingUp className="size-4 text-primary" />}
                                        />
                                        <MetricTile
                                            label="INVERSORES ATIVOS"
                                            value={`${analytics.overview.activeInverters} / ${analytics.overview.totalInverters}`}
                                            sublabel="Equipamentos que enviaram dados hoje"
                                            icon={<Database className="size-4 text-primary" />}
                                        />
                                        <EfficiencyGauge percent={efficiencyPct} hint="Potência média em relação ao pico do dia" />
                                    </>
                                ) : (
                                    <>
                                        <MetricTile
                                            label="ENERGIA TOTAL"
                                            value={formatKwh(analytics.overview.totalEnergy)}
                                            sublabel="Soma de tudo o que foi gerado no período"
                                            icon={<Zap className="size-4 text-primary" />}
                                        />
                                        <MetricTile
                                            label="POTÊNCIA MÉDIA"
                                            value={formatW(analytics.overview.averagePower)}
                                            sublabel="Média das leituras do período"
                                            icon={<Activity className="size-4 text-primary" />}
                                        />
                                        <MetricTile
                                            label="PICO DE POTÊNCIA"
                                            value={formatW(analytics.overview.peakPower)}
                                            sublabel="Maior potência registrada no período"
                                            icon={<TrendingUp className="size-4 text-primary" />}
                                        />
                                        <MetricTile
                                            label="PONTOS DE DADOS"
                                            value={`${analytics.overview.totalDataPoints}`}
                                            sublabel="Leituras recebidas dos inversores"
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
                                <p className="text-sm text-muted-foreground" data-testid="period-summary">
                                    {periodSummary(periodType, analytics)}
                                </p>
                                <GlowChart
                                    bars={isWeek}
                                    data={chartData}
                                    dataKey="energia"
                                    xKey="label"
                                    valueLabel="Energia"
                                    valueFormatter={(value) =>
                                        `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value)} kWh`
                                    }
                                />
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

