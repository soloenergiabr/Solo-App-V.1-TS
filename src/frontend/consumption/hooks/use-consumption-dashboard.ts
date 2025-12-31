import { useCallback, useEffect, useState } from "react";
import { useAuthenticatedApi } from "@/frontend/auth/hooks/useAuthenticatedApi";
import { addYears, startOfYear, endOfYear, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ConsumptionDashboardData {
    history: {
        competenceDate: string;
        consumptionKwh: number;
        injectedEnergyKwh: number;
        tariffPerKwh: number;
        totalBillValue: number;
    }[];
    savings: {
        period: string;
        expectedBill: number;
        actualBill: number;
        savings: number;
    }[];
    totalSavings: number;
}

export interface ConsumptionFilters {
    currentDate?: Date; // Data base para o filtro (geralmente ano)
}

interface UseConsumptionDashboardParams {
    clientId?: string;
}

export const useConsumptionDashboard = ({ clientId }: UseConsumptionDashboardParams) => {
    const api = useAuthenticatedApi();
    const [data, setData] = useState<ConsumptionDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState<ConsumptionFilters>({
        currentDate: new Date(),
    });

    const fetchConsumptionData = useCallback(async (customFilters?: ConsumptionFilters) => {
        if (!process.env.NEXT_PUBLIC_API_URL && !api.isAuthenticated) return;
        // Allows fetching if authenticated or just relying on api wrapper handling
        if (!api.isAuthenticated) return;

        try {
            setIsLoading(true);
            setError(null);

            const activeFilters = customFilters || filters;
            const queryParams = new URLSearchParams();

            if (clientId) queryParams.append('clientId', clientId);

            const date = activeFilters.currentDate || new Date();
            const startDate = startOfYear(date);
            const endDate = endOfYear(date);

            queryParams.append('startDate', startDate.toISOString());
            queryParams.append('endDate', endDate.toISOString());

            const response = await api.get(`/consumption/dashboard?${queryParams.toString()}`);

            if (response.data.success) {
                setData(response.data.data);
            } else {
                setError(response.data.message || 'Failed to fetch consumption data');
            }
        } catch (err: any) {
            console.error('Error fetching consumption data:', err);
            setError(err.response?.data?.message || 'An error occurred while fetching data');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    const goToPreviousPeriod = useCallback(() => {
        setFilters(prev => ({
            ...prev,
            currentDate: addYears(prev.currentDate || new Date(), -1)
        }));
    }, []);

    const goToNextPeriod = useCallback(() => {
        setFilters(prev => ({
            ...prev,
            currentDate: addYears(prev.currentDate || new Date(), 1)
        }));
    }, []);

    const goToToday = useCallback(() => {
        setFilters(prev => ({ ...prev, currentDate: new Date() }));
    }, []);

    const getCurrentPeriodLabel = useCallback(() => {
        const date = filters.currentDate || new Date();
        return format(date, "yyyy", { locale: ptBR });
    }, [filters]);

    useEffect(() => {
        if (api.isAuthenticated && clientId) {
            fetchConsumptionData();
        }
    }, [api.isAuthenticated, clientId, filters.currentDate, fetchConsumptionData]);

    return {
        data,
        isLoading,
        error,
        filters,
        goToPreviousPeriod,
        goToNextPeriod,
        goToToday,
        getCurrentPeriodLabel,
        refetch: fetchConsumptionData
    };
};
