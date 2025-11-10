'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';

// Types
export interface RefererLinkState {
    link: string | null;
    isLoading: boolean;
    error: string | null;
}

export function useRefererLink() {
    const api = useAuthenticatedApi();
    const [state, setState] = useState<RefererLinkState>({
        link: null,
        isLoading: false,
        error: null,
    });

    // Buscar link de indicação
    const fetchRefererLink = useCallback(async () => {
        if (!api.isAuthenticated) return;

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await api.get('/club/referer-link');

            if (response.data.success) {
                setState({
                    link: response.data.data.link,
                    isLoading: false,
                    error: null,
                });
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Erro ao buscar link de indicação',
                }));
            }
        } catch (error: any) {
            console.error('Error fetching referer link:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.message || 'Erro de rede',
            }));
        }
    }, [api]);

    // Buscar link na inicialização
    useEffect(() => {
        if (api.isAuthenticated) {
            fetchRefererLink();
        }
    }, []);

    // Copiar link para clipboard
    const copyToClipboard = useCallback(async () => {
        if (!state.link) return false;

        try {
            await navigator.clipboard.writeText(state.link);
            return true;
        } catch (error) {
            console.error('Failed to copy link:', error);
            return false;
        }
    }, [state.link]);

    return {
        ...state,
        fetchRefererLink,
        copyToClipboard,
    };
}
