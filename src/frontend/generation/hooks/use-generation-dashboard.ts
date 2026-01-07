import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useAuthenticatedApi } from "@/frontend/auth/hooks/useAuthenticatedApi";
import { addMonths, addYears, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, format } from "date-fns";
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
    const [filters, setFilters] = useState<DashboardFilters>({
        generationUnitType: 'real_time',
        currentDate: new Date(),
    });

    // Calcula startDate e endDate baseado no tipo e currentDate
    const getDateRange = useCallback((type: DashboardFilters['generationUnitType'], date: Date) => {
        if (type === 'real_time') {
            return {
                startDate: startOfDay(new Date()).toISOString(),
                endDate: endOfDay(new Date()).toISOString(),
            };
        } else if (type === 'day') {
            return {
                startDate: startOfMonth(date).toISOString(),
                endDate: endOfMonth(date).toISOString(),
            };
        } else if (type === 'month') {
            return {
                startDate: startOfYear(date).toISOString(),
                endDate: endOfYear(date).toISOString(),
            };
        } else if (type === 'year') {
            return {
                startDate: undefined,
                endDate: undefined,
            };
        }
        return { startDate: undefined, endDate: undefined };
    }, []);

    // Build query key that updates when filters change
    const queryKey = useMemo(() => {
        const dateRange = getDateRange(filters.generationUnitType, filters.currentDate || new Date());
        return [
            'generation-dashboard',
            filters.generationUnitType,
            filters.inverterIds?.join(',') || '',
            dateRange.startDate || '',
            dateRange.endDate || '',
            clientId || '',
        ];
    }, [filters, getDateRange, clientId]);

    // Fetch function for React Query
    const fetchDashboardAnalytics = useCallback(async (): Promise<DashboardAnalytics | null> => {
        const params = new URLSearchParams();

        if (filters.generationUnitType) {
            params.append('type', filters.generationUnitType);
        }
        if (filters.inverterIds && filters.inverterIds.length > 0) {
            params.append('inverterIds', filters.inverterIds.join(','));
        }

        const dateRange = getDateRange(
            filters.generationUnitType,
            filters.currentDate || new Date()
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
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to fetch dashboard analytics');
    }, [filters, getDateRange, clientId, api]);

    // Use React Query with 5 second refetch interval for real_time mode
    const {
        data: analytics,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey,
        queryFn: fetchDashboardAnalytics,
        enabled: api.isAuthenticated,
        refetchInterval: filters.generationUnitType === 'real_time' ? 5000 : false,
        staleTime: filters.generationUnitType === 'real_time' ? 0 : 1000 * 60, // 0 for real_time, 1 min otherwise
    });

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
                newDate = addMonths(currentDate, -1);
            } else if (prev.generationUnitType === 'month') {
                newDate = addYears(currentDate, -1);
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
                newDate = addMonths(currentDate, 1);
            } else if (prev.generationUnitType === 'month') {
                newDate = addYears(currentDate, 1);
            } else {
                newDate = currentDate;
            }

            return { ...prev, currentDate: newDate };
        });
    }, []);

    const goToToday = useCallback(() => {
        setFilters(prev => ({ ...prev, currentDate: new Date() }));
    }, []);

    // Formatar período atual para exibição
    const getCurrentPeriodLabel = useCallback(() => {
        const date = filters.currentDate || new Date();
        const type = filters.generationUnitType;

        if (type === 'real_time') {
            return 'Tempo Real - Hoje';
        } else if (type === 'day') {
            return format(date, "MMMM 'de' yyyy", { locale: ptBR });
        } else if (type === 'month') {
            return format(date, "yyyy", { locale: ptBR });
        } else if (type === 'year') {
            return 'Todos os Anos';
        }
        return '';
    }, [filters]);

    return {
        analytics: analytics ?? null,
        isLoading,
        error: error ? (error as Error).message : null,
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