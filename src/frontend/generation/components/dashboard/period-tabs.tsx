'use client';

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { DashboardFilters } from "../../hooks/use-generation-dashboard";
import { cn } from "@/lib/utils";

interface PeriodTabsProps {
    filters: DashboardFilters;
    currentPeriodLabel: string;
    onUpdateFilters: (filters: Partial<DashboardFilters>) => void;
    onPreviousPeriod: () => void;
    onNextPeriod: () => void;
    onToday: () => void;
    onRefresh: () => void;
    isLoading: boolean;
}

export function PeriodTabs({
    filters,
    currentPeriodLabel,
    onUpdateFilters,
    onPreviousPeriod,
    onNextPeriod,
    onToday,
    onRefresh,
    isLoading,
}: PeriodTabsProps) {
    const isHistorical = filters.generationUnitType !== 'real_time';

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                {isHistorical && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onToday}
                        disabled={isLoading}
                        className="h-8 text-xs"
                    >
                        Hoje
                    </Button>
                )}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="h-8 w-8"
                >
                    <RefreshCw className={cn(
                        "h-4 w-4",
                        isLoading && "animate-spin"
                    )} />
                </Button>
            </div>
            {/* Tabs de Período */}
            <Tabs
                value={filters.generationUnitType || 'real_time'}
                onValueChange={(value) =>
                    onUpdateFilters({
                        generationUnitType: value as DashboardFilters['generationUnitType'],
                        currentDate: new Date(),
                    })
                }
                className="w-full"
            >
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="real_time" className="text-xs">
                        Tempo Real
                    </TabsTrigger>
                    <TabsTrigger value="day" className="text-xs">
                        Diário
                    </TabsTrigger>
                    <TabsTrigger value="month" className="text-xs">
                        Mensal
                    </TabsTrigger>
                    <TabsTrigger value="year" className="text-xs">
                        Anual
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Navegação de Período */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    {isHistorical && (
                        <>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={onPreviousPeriod}
                                disabled={isLoading}
                                className="h-8 w-8"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                        </>
                    )}
                </div>

                <div className="flex-1 text-center">
                    <span className="text-sm font-medium">{currentPeriodLabel}</span>
                </div>


                {isHistorical && (
                    <>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={onNextPeriod}
                            disabled={isLoading}
                            className="h-8 w-8"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
