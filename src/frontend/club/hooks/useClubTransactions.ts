'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';

// Types
export interface ClubTransaction {
    id: string;
    type: string;
    amount: number;
    description?: string;
    createdAt: string;
}

export interface TransactionsState {
    transactions: ClubTransaction[];
    isLoading: boolean;
    error: string | null;
}

export function useClubTransactions() {
    const api = useAuthenticatedApi();
    const [state, setState] = useState<TransactionsState>({
        transactions: [],
        isLoading: false,
        error: null,
    });

    // Buscar transações
    const fetchTransactions = useCallback(async () => {
        if (!api.isAuthenticated) return;

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await api.get('/club/transactions');

            if (response.data.success) {
                setState({
                    transactions: response.data.data,
                    isLoading: false,
                    error: null,
                });
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Erro ao buscar transações',
                }));
            }
        } catch (error: any) {
            console.error('Error fetching transactions:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.message || 'Erro de rede',
            }));
        }
    }, [api]);

    // Buscar transações na inicialização
    useEffect(() => {
        if (api.isAuthenticated) {
            fetchTransactions();
        }
    }, []);

    return {
        ...state,
        fetchTransactions,
        refetch: fetchTransactions,
    };
}
