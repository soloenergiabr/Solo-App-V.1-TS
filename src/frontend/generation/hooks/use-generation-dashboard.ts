import { useCallback, useEffect, useState } from "react";
import { useAuthenticatedApi } from "@/frontend/auth/hooks/useAuthenticatedApi";
import { addDays, addMonths, addYears, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface DashboardFilters {
    generationUnitType?: 'real_time' | 'day' | 'month' | 'year';
    inverterIds?: string[];
    currentDate?: Date; // Data atual para navegação
}

export interface DashboardAnalytics {
    overview: {
        totalEnergy: number;
        totalPower: number;
        averageEnergy: number;
        averagePower: number;
        peakPower: number;
        peakPowerTimestamp?: string;
        totalInverters: number;
        activeInverters: number;
        totalDataPoints: number;
    };
    timeSeries: Array<{
        timestamp: string;
        energy: number;
        power: number;
        inverterCount: number;
    }>;
    byInverter: Array<{
        inverterId: string;
        inverterName: string;
        provider: string;
        totalEnergy: number;
        totalPower: number;
        averageEnergy: number;
        averagePower: number;
        peakPower: number;
        dataPoints: number;
        lastUpdate?: string;
    }>;
    byType: {
        real_time?: {
            totalEnergy: number;
            totalPower: number;
            dataPoints: number;
        };
        day?: {
            totalEnergy: number;
            totalPower: number;
            dataPoints: number;
        };
        month?: {
            totalEnergy: number;
            totalPower: number;
            dataPoints: number;
        };
        year?: {
            totalEnergy: number;
            totalPower: number;
            dataPoints: number;
        };
    };
    comparison?: {
        previousPeriod?: {
            totalEnergy: number;
            totalPower: number;
            dataPoints: number;
        };
        percentageChange?: {
            energy: number;
            power: number;
        };
    };
    filters: {
        generationUnitType?: string;
        inverterIds?: string[];
        startDate?: string;
        endDate?: string;
        appliedFilters: number;
    };
}

export function useGenerationDashboard({ clientId }: { clientId?: string }) {
    const api = useAuthenticatedApi();
    const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<DashboardFilters>({
        generationUnitType: 'real_time',
        currentDate: new Date(),
    });

    // Calcula startDate e endDate baseado no tipo e currentDate
    const getDateRange = useCallback((type: DashboardFilters['generationUnitType'], date: Date) => {
        if (type === 'real_time') {
            // Tempo real: apenas hoje
            return {
                startDate: startOfDay(new Date()).toISOString(),
                endDate: endOfDay(new Date()).toISOString(),
            };
        } else if (type === 'day') {
            // Diário: mostra todos os dias do mês selecionado
            return {
                startDate: startOfMonth(date).toISOString(),
                endDate: endOfMonth(date).toISOString(),
            };
        } else if (type === 'month') {
            // Mensal: mostra todos os meses do ano selecionado
            return {
                startDate: startOfYear(date).toISOString(),
                endDate: endOfYear(date).toISOString(),
            };
        } else if (type === 'year') {
            // Anual: busca todos os dados disponíveis para agregar por ano
            return {
                startDate: undefined,
                endDate: undefined,
            };
        }
        return { startDate: undefined, endDate: undefined };
    }, []);

    const fetchDashboardAnalytics = useCallback(async (customFilters?: DashboardFilters) => {
        if (!api.isAuthenticated) return;

        try {
            setIsLoading(true);
            setError(null);

            const activeFilters = customFilters || filters;
            const params = new URLSearchParams();

            if (activeFilters.generationUnitType) {
                params.append('type', activeFilters.generationUnitType);
            }
            if (activeFilters.inverterIds && activeFilters.inverterIds.length > 0) {
                params.append('inverterIds', activeFilters.inverterIds.join(','));
            }

            // Calcular datas baseado no tipo e currentDate
            const dateRange = getDateRange(
                activeFilters.generationUnitType,
                activeFilters.currentDate || new Date()
            );

            if (dateRange.startDate) {
                params.append('startDate', dateRange.startDate);
            }
            if (dateRange.endDate) {
                params.append('endDate', dateRange.endDate);
            }
            if (clientId) {
                params.append('clientId', clientId);
            }

            const response = await api.get(`/generation/dashboard?${params.toString()}`);

            if (response.data.success) {
                setAnalytics(response.data.data);
            } else {
                setError(response.data.message || 'Failed to fetch dashboard analytics');
            }
        } catch (error: any) {
            console.error('Error fetching dashboard analytics:', error);
            setError(error.response?.data?.message || 'Network error');
        } finally {
            setIsLoading(false);
        }
    }, [filters, getDateRange]);

    const updateFilters = useCallback((newFilters: Partial<DashboardFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({
            generationUnitType: 'real_time',
            currentDate: new Date(),
        });
    }, []);

    // Navegação de período
    const goToPreviousPeriod = useCallback(() => {
        setFilters(prev => {
            const currentDate = prev.currentDate || new Date();
            let newDate: Date;

            if (prev.generationUnitType === 'day') {
                // Diário: navega por meses
                newDate = addMonths(currentDate, -1);
            } else if (prev.generationUnitType === 'month') {
                // Mensal: navega por anos
                newDate = addYears(currentDate, -1);
            } else if (prev.generationUnitType === 'year') {
                // Anual: não tem navegação de período
                newDate = currentDate;
            } else {
                newDate = currentDate;
            }

            return { ...prev, currentDate: newDate };
        });
    }, []);

    const goToNextPeriod = useCallback(() => {
        setFilters(prev => {
            const currentDate = prev.currentDate || new Date();
            let newDate: Date;

            if (prev.generationUnitType === 'day') {
                // Diário: navega por meses
                newDate = addMonths(currentDate, 1);
            } else if (prev.generationUnitType === 'month') {
                // Mensal: navega por anos
                newDate = addYears(currentDate, 1);
            } else if (prev.generationUnitType === 'year') {
                // Anual: não tem navegação de período
                newDate = currentDate;
            } else {
                newDate = currentDate;
            }

            return { ...prev, currentDate: newDate };
        });
    }, []);

    const goToToday = useCallback(() => {
        setFilters(prev => ({ ...prev, currentDate: new Date() }));
    }, []);

    const refetch = useCallback(() => {
        return fetchDashboardAnalytics();
    }, [fetchDashboardAnalytics]);

    // Formatar período atual para exibição
    const getCurrentPeriodLabel = useCallback(() => {
        const date = filters.currentDate || new Date();
        const type = filters.generationUnitType;

        if (type === 'real_time') {
            return 'Tempo Real - Hoje';
        } else if (type === 'day') {
            // Diário: mostra o mês selecionado
            return format(date, "MMMM 'de' yyyy", { locale: ptBR });
        } else if (type === 'month') {
            // Mensal: mostra o ano selecionado
            return format(date, "yyyy", { locale: ptBR });
        } else if (type === 'year') {
            // Anual: mostra "Todos os Anos"
            return 'Todos os Anos';
        }
        return '';
    }, [filters]);

    useEffect(() => {
        if (api.isAuthenticated) {
            fetchDashboardAnalytics();
        }
    }, [api.isAuthenticated, filters, fetchDashboardAnalytics]);

    return {
        analytics,
        isLoading,
        error,
        filters,
        updateFilters,
        clearFilters,
        refetch,
        fetchDashboardAnalytics,
        goToPreviousPeriod,
        goToNextPeriod,
        goToToday,
        getCurrentPeriodLabel,
    };
}