'use client';

import { useEffect, useState } from 'react';
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

export function useRateio() {
    const api = useAuthenticatedApi();
    const [allocations, setAllocations] = useState<RateioAllocation[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = () => {
        if (!api.isAuthenticated) return;
        setIsLoading(true);
        api.get('/rateio')
            .then((res) => {
                if (res.data.success) setAllocations(res.data.data);
                else setError(res.data.message || 'Falha ao carregar rateios');
            })
            .catch((e) => setError(e?.response?.data?.message || 'Erro ao carregar rateios'))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetch();
    }, [api.isAuthenticated]);

    return { allocations, isLoading, error, refetch: fetch };
}
