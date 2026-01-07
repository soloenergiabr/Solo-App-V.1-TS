'use client';

import { withAuth } from '@/frontend/auth/contexts/auth-context';
import { useGenerationDashboard } from '@/frontend/generation/hooks/use-generation-dashboard';
import { CompactMetrics } from '@/frontend/generation/components/dashboard/compact-metrics';
import { PeriodTabs } from '@/frontend/generation/components/dashboard/period-tabs';
import { AdaptiveChart } from '@/frontend/generation/components/dashboard/adaptive-chart';
import { InvertersTable } from '@/frontend/generation/components/dashboard/inverters-table';
import { InvertersComparisonChart } from '@/frontend/generation/components/dashboard/inverters-comparison-chart';
import { InverterMultiSelect } from '@/components/ui/inverter-multi-select';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Filter } from "lucide-react";
import { PageHeader, PageLayout } from '@/components/ui/page-layout';

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
                            {/* Métricas Compactas */}
                            <CompactMetrics
                                analytics={analytics}
                                isRealTime={filters.generationUnitType === 'real_time'}
                            />

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
                            <Card>
                                <AdaptiveChart
                                    analytics={analytics}
                                    viewType={filters.generationUnitType}
                                />
                            </Card>

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

