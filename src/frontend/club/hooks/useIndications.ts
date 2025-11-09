'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';

// Types
export interface Indication {
    id: string;
    referrer?: {
        id: string;
        name: string;
        email: string;
    };
    referred?: {
        id: string;
        name: string;
        email: string;
    };
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface IndicationsState {
    indications: Indication[];
    isLoading: boolean;
    error: string | null;
}

export function useIndications(type: 'as_referrer' | 'as_referred' = 'as_referrer') {
    const api = useAuthenticatedApi();
    const [state, setState] = useState<IndicationsState>({
        indications: [],
        isLoading: false,
        error: null,
    });

    // Buscar indicações
    const fetchIndications = useCallback(async () => {
        if (!api.isAuthenticated) return;

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await api.get(`/club/indications?type=${type}`);

            if (response.data.success) {
                setState({
                    indications: response.data.data,
                    isLoading: false,
                    error: null,
                });
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Erro ao buscar indicações',
                }));
            }
        } catch (error: any) {
            console.error('Error fetching indications:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.message || 'Erro de rede',
            }));
        }
    }, [api, type]);

    // Buscar indicações na inicialização
    useEffect(() => {
        if (api.isAuthenticated) {
            fetchIndications();
        }
    }, []);

    return {
        ...state,
        fetchIndications,
        refetch: fetchIndications,
    };
}
