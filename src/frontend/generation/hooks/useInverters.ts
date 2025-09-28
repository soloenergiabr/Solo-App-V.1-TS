'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';

export interface Inverter {
    id: string;
    provider: string;
    providerId: string;
    clientId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateInverterRequest {
    provider: string;
    providerId: string;
    providerApiKey?: string;
    providerApiSecret?: string;
    providerUrl?: string;
}

export function useInverters() {
    const [inverters, setInverters] = useState<Inverter[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const api = useAuthenticatedApi();

    // Buscar todos os inversores
    const fetchInverters = useCallback(async () => {
        if (!api.isAuthenticated) return;

        try {
            setIsLoading(true);
            setError(null);

            const response = await api.get('/generation/inverters');

            if (response.data.success) {
                setInverters(response.data.data);
            } else {
                setError(response.data.message || 'Failed to fetch inverters');
            }
        } catch (error: any) {
            console.error('Error fetching inverters:', error);
            setError(error.response?.data?.message || 'Network error');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Criar novo inversor
    const createInverter = useCallback(async (inverterData: CreateInverterRequest) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await api.post('/generation/inverters', inverterData);

            if (response.data.success) {
                // Atualizar lista de inversores
                await fetchInverters();
                return { success: true, data: response.data.data };
            } else {
                setError(response.data.message || 'Failed to create inverter');
                return { success: false, error: response.data.message };
            }
        } catch (error: any) {
            console.error('Error creating inverter:', error);
            const errorMessage = error.response?.data?.message || 'Network error';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, [fetchInverters]);

    // Buscar inversor por ID
    const getInverterById = useCallback(async (id: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await api.get(`/generation/inverters/${id}`);

            if (response.data.success) {
                return { success: true, data: response.data.data };
            } else {
                setError(response.data.message || 'Failed to fetch inverter');
                return { success: false, error: response.data.message };
            }
        } catch (error: any) {
            console.error('Error fetching inverter:', error);
            const errorMessage = error.response?.data?.message || 'Network error';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Carregar inversores na inicialização
    useEffect(() => {
        if (api.isAuthenticated) {
            fetchInverters();
        }
    }, [api.isAuthenticated, fetchInverters]);

    return {
        inverters,
        isLoading,
        error,
        fetchInverters,
        createInverter,
        getInverterById,
        refetch: fetchInverters,
    };
}
