'use client';

import { useCallback } from 'react';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import { useIndications } from './useIndications';
import { useClubBalance } from './useClubBalance';
import { useClubTransactions } from './useClubTransactions';

// Re-export types
export type { Indication } from './useIndications';
export type { ClubBalance } from './useClubBalance';
export type { ClubTransaction } from './useClubTransactions';

// Request types for actions
export interface RedeemOfferRequest {
    offerId: string;
}

export function useClub() {
    const api = useAuthenticatedApi();

    // Hooks individuais
    const indicationsAsReferrer = useIndications('as_referrer');
    const indicationsAsReferred = useIndications('as_referred');
    const balance = useClubBalance();
    const transactions = useClubTransactions();

    // Resgatar oferta
    const redeemOffer = useCallback(async (offerData: RedeemOfferRequest) => {
        if (!api.isAuthenticated) {
            return { success: false, error: 'Usuário não autenticado' };
        }

        try {
            const response = await api.post('/club/redeem-offer', offerData);

            if (response.data.success) {
                // Atualizar saldo após resgate
                balance.refetch();
                transactions.refetch();
                return { success: true, data: response.data.data };
            } else {
                return { success: false, error: response.data.message };
            }
        } catch (error: any) {
            console.error('Error redeeming offer:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Erro de rede'
            };
        }
    }, [api, balance, transactions]);

    // Refresh all data
    const refreshAll = useCallback(async () => {
        await Promise.all([
            indicationsAsReferrer.refetch(),
            indicationsAsReferred.refetch(),
            balance.refetch(),
            transactions.refetch(),
        ]);
    }, [indicationsAsReferrer, indicationsAsReferred, balance, transactions]);

    return {
        // Indicações
        indicationsAsReferrer,
        indicationsAsReferred,

        // Saldo
        balance,

        // Transações
        transactions,

        // Ações
        redeemOffer,

        // Utilitários
        refreshAll,
    };
}
