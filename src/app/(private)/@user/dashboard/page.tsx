'use client';

import { withAuth } from '@/frontend/auth/contexts/auth-context';
import { useGenerationDashboard } from '@/frontend/generation/hooks/use-generation-dashboard';
import { OverviewCards } from '@/frontend/generation/components/dashboard/overview-cards';
import { AdaptiveChart } from '@/frontend/generation/components/dashboard/adaptive-chart';
import { TypeDistributionChart } from '@/frontend/generation/components/dashboard/type-distribution-chart';
import { InvertersTable } from '@/frontend/generation/components/dashboard/inverters-table';
import { InvertersComparisonChart } from '@/frontend/generation/components/dashboard/inverters-comparison-chart';
import { DashboardFiltersComponent } from '@/frontend/generation/components/dashboard/dashboard-filters';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, BarChart3 } from "lucide-react";

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
    } = useGenerationDashboard();

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
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <BarChart3 className="h-8 w-8" />
                        Dashboard de Geração
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Monitore a performance dos seus inversores em tempo real
                    </p>
                </div>
            </div>

            {/* Filtros */}
            <DashboardFiltersComponent
                filters={filters}
                currentPeriodLabel={getCurrentPeriodLabel()}
                onUpdateFilters={updateFilters}
                onPreviousPeriod={goToPreviousPeriod}
                onNextPeriod={goToNextPeriod}
                onToday={goToToday}
                onRefresh={refetch}
                isLoading={isLoading}
            />

            {/* Loading State */}
            {isLoading && !analytics ? (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-32" />
                        ))}
                    </div>
                    <Skeleton className="h-[400px]" />
                    <div className="grid gap-4 md:grid-cols-2">
                        <Skeleton className="h-[400px]" />
                        <Skeleton className="h-[400px]" />
                    </div>
                </div>
            ) : analytics ? (
                <>
                    {/* Overview Cards */}
                    <OverviewCards
                        analytics={analytics}
                        isRealTime={filters.generationUnitType === 'real_time'}
                    />

                    {/* Adaptive Chart - Muda entre Line e Bar baseado no tipo */}
                    <AdaptiveChart
                        analytics={analytics}
                        viewType={filters.generationUnitType}
                    />

                    {/* Charts Grid */}
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Comparison Card */}
                        {analytics.comparison && (
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-6 border">
                                <h3 className="text-lg font-semibold mb-4">Comparação com Período Anterior</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Energia</p>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <span className="text-2xl font-bold">
                                                {analytics.comparison.percentageChange?.energy.toFixed(1)}%
                                            </span>
                                            <span className={`text-sm font-medium ${(analytics.comparison.percentageChange?.energy || 0) >= 0
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                                }`}>
                                                {(analytics.comparison.percentageChange?.energy || 0) >= 0 ? '↑' : '↓'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Período anterior: {analytics.comparison.previousPeriod?.totalEnergy.toFixed(2)} kWh
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Potência</p>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <span className="text-2xl font-bold">
                                                {analytics.comparison.percentageChange?.power.toFixed(1)}%
                                            </span>
                                            <span className={`text-sm font-medium ${(analytics.comparison.percentageChange?.power || 0) >= 0
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                                }`}>
                                                {(analytics.comparison.percentageChange?.power || 0) >= 0 ? '↑' : '↓'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Período anterior: {analytics.comparison.previousPeriod?.totalPower.toFixed(2)} W
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Inverters Comparison Chart */}
                    {analytics.byInverter.length > 1 && (
                        <InvertersComparisonChart analytics={analytics} />
                    )}

                    {/* Inverters Table */}
                    <InvertersTable analytics={analytics} />

                    {/* Summary Footer */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
                        <div>
                            {analytics.filters.appliedFilters > 0 && (
                                <span>
                                    {analytics.filters.appliedFilters} filtro(s) aplicado(s)
                                </span>
                            )}
                        </div>
                        <div>
                            Última atualização: {new Date().toLocaleString('pt-BR')}
                        </div>
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
    );
}

export default withAuth(GenerationDashboardPage);
