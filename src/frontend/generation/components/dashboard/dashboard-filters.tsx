'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw, Calendar as CalendarIcon } from "lucide-react";
import { DashboardFilters } from "../../hooks/use-generation-dashboard";
import { cn } from "@/lib/utils";

interface DashboardFiltersProps {
    filters: DashboardFilters;
    currentPeriodLabel: string;
    onUpdateFilters: (filters: Partial<DashboardFilters>) => void;
    onPreviousPeriod: () => void;
    onNextPeriod: () => void;
    onToday: () => void;
    onRefresh: () => void;
    isLoading: boolean;
}

export function DashboardFiltersComponent({
    filters,
    currentPeriodLabel,
    onUpdateFilters,
    onPreviousPeriod,
    onNextPeriod,
    onToday,
    onRefresh,
    isLoading,
}: DashboardFiltersProps) {
    const isRealTime = filters.generationUnitType === 'real_time';
    const isHistorical = filters.generationUnitType !== 'real_time';
    const canNavigate = isHistorical;

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4">
                    {/* Tipo de Visualização */}
                    <div className="flex items-center gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="type" className="text-xs text-muted-foreground">Visualização</Label>
                            <Select
                                value={filters.generationUnitType || 'real_time'}
                                onValueChange={(value) =>
                                    onUpdateFilters({
                                        generationUnitType: value as DashboardFilters['generationUnitType'],
                                        currentDate: new Date(),
                                    })
                                }
                            >
                                <SelectTrigger id="type" className="w-[180px]">
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="real_time">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                            Tempo Real
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="day">📅 Histórico Diário</SelectItem>
                                    <SelectItem value="month">📊 Histórico Mensal</SelectItem>
                                    <SelectItem value="year">📈 Histórico Anual</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Navegação de Período */}
                    {canNavigate && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={onPreviousPeriod}
                                disabled={isLoading}
                                title="Período anterior"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-md min-w-[200px] justify-center">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium text-sm">{currentPeriodLabel}</span>
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={onNextPeriod}
                                disabled={isLoading}
                                title="Próximo período"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>

                            <Button
                                variant="outline"
                                onClick={onToday}
                                disabled={isLoading}
                                title="Ir para hoje"
                            >
                                Hoje
                            </Button>
                        </div>
                    )}

                    {/* Label para Tempo Real */}
                    {isRealTime && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950 rounded-md border border-green-200 dark:border-green-800">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="font-medium text-sm text-green-700 dark:text-green-300">
                                {currentPeriodLabel}
                            </span>
                        </div>
                    )}

                    {/* Botão de Atualizar */}
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onRefresh}
                        disabled={isLoading}
                        title="Atualizar dados"
                    >
                        <RefreshCw className={cn(
                            "h-4 w-4",
                            isLoading && "animate-spin"
                        )} />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
