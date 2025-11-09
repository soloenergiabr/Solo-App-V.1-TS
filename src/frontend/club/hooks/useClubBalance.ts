'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';

// Types
export interface ClubBalance {
    balance: number;
    currency: string;
}

export interface BalanceState {
    balance: ClubBalance | null;
    isLoading: boolean;
    error: string | null;
}

export function useClubBalance() {
    const api = useAuthenticatedApi();
    const [state, setState] = useState<BalanceState>({
        balance: null,
        isLoading: false,
        error: null,
    });

    // Buscar saldo
    const fetchBalance = useCallback(async () => {
        if (!api.isAuthenticated) return;

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await api.get('/club/balance');

            if (response.data.success) {
                setState({
                    balance: response.data.data,
                    isLoading: false,
                    error: null,
                });
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Erro ao buscar saldo',
                }));
            }
        } catch (error: any) {
            console.error('Error fetching balance:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.message || 'Erro de rede',
            }));
        }
    }, [api]);

    // Buscar saldo na inicialização
    useEffect(() => {
        if (api.isAuthenticated) {
            fetchBalance();
        }
    }, []);

    return {
        ...state,
        fetchBalance,
        refetch: fetchBalance,
    };
}
