'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';

export interface RateioAllocation {
    id: string;
    clientId: string;
    plantId: string;
    fromId: string;
    toId: string;
    allocationPercentage: number;
    startsAt: string | null;
    endsAt: string | null;
    isActive: boolean;
    enelSyncStatus: 'draft' | 'pending_push' | 'applied' | 'failed';
    requestedAt: string | null;
    appliedAt: string | null;
    effectiveDate: string | null;
    enelProtocol: string | null;
    syncError: string | null;
    requestedByUserId: string | null;
    appliedByUserId: string | null;
    createdAt: string;
    updatedAt: string;
    plant: { id: string; name: string | null } | null;
    from: { id: string; name: string | null; clientNumber: string | null } | null;
    to: { id: string; name: string | null; clientNumber: string | null } | null;
}

export interface ProposalInput {
    plantId: string;
    fromId: string;
    toId: string;
    allocationPercentage: number;
    startsAt?: string;
}

export function useRateio() {
    const api = useAuthenticatedApi();

    return useQuery({
        queryKey: ['rateio'],
        queryFn: async () => {
            const res = await api.get('/rateio');
            if (!res.data.success) throw new Error(res.data.message || 'Falha ao carregar rateios');
            return res.data.data as RateioAllocation[];
        },
        enabled: api.isAuthenticated,
    });
}

export function useCreateProposal() {
    const queryClient = useQueryClient();
    const api = useAuthenticatedApi();

    return useMutation({
        mutationFn: async (data: ProposalInput) => {
            const res = await api.post('/rateio/proposals', data);
            if (!res.data.success) throw new Error(res.data.message || 'Falha ao criar proposta');
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rateio'] });
        },
    });
}
