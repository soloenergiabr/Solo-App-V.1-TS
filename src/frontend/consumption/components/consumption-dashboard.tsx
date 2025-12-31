import { ConsumptionChart } from "./consumption-chart";
import { SavingsCard } from "./savings-card";
import { useConsumptionDashboard } from "../hooks/use-consumption-dashboard";
import { PageHeader, PageLayout } from "@/components/ui/page-layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ConsumptionDashboardProps {
    clientId: string;
}

export function ConsumptionDashboard({ clientId }: ConsumptionDashboardProps) {
    const {
        data,
        isLoading,
        error,
        getCurrentPeriodLabel,
        goToPreviousPeriod,
        goToNextPeriod,
        goToToday,
        refetch
    } = useConsumptionDashboard({ clientId });

    if (error) {
        return (
            <div className="p-6">
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
                    title="Economia e Consumo"
                    subtitle="Acompanhe sua economia mensal e histórico de consumo"
                />
            }
        >
            <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                    {isLoading && !data ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton key={i} className="h-24" />
                                ))}
                            </div>
                            <Skeleton className="h-10" />
                            <Skeleton className="h-[400px]" />
                        </div>
                    ) : data ? (
                        <>
                            {/* Metrics Grid */}
                            <SavingsCard
                                totalSavings={data.totalSavings}
                                lastMonthSavings={data.savings.length > 0 ? data.savings[data.savings.length - 1].savings : 0}
                            />

                            {/* Consumption Chart Section with Navigation */}
                            <Card>
                                <CardContent className="p-0">
                                    <div className="p-4 border-b flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={goToToday}
                                                disabled={isLoading}
                                                className="h-8 text-xs"
                                            >
                                                Hoje
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => refetch()}
                                                disabled={isLoading}
                                                className="h-8 w-8"
                                            >
                                                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                            </Button>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={goToPreviousPeriod}
                                                disabled={isLoading}
                                                className="h-8 w-8"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <span className="text-sm font-medium w-20 text-center">{getCurrentPeriodLabel()}</span>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={goToNextPeriod}
                                                disabled={isLoading}
                                                className="h-8 w-8"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <ConsumptionChart
                                        data={data.history}
                                        periodLabel={getCurrentPeriodLabel()}
                                    />
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Nenhum dado disponível</AlertTitle>
                            <AlertDescription>
                                Não há dados de consumo para exibir no momento.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
        </PageLayout>
    );
}
