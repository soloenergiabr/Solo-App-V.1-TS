'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import type {
    FaturapiBalance,
    FaturapiConnection,
    FaturapiCredentials,
    FaturapiExtraction,
    FaturapiUnit,
    FaturapiUsage,
} from '@/backend/integrations/faturapi/faturapi.types';

export type { FaturapiConnection, FaturapiExtraction, FaturapiUnit };

type ApiEnvelope<T> = { success: boolean; data: T; message?: string };

type ClientRef = { id: string; name: string };

export type FaturapiOverview = {
    balance: FaturapiBalance | null;
    usage: FaturapiUsage['totals'] | null;
    errors: string[];
    units: Array<{
        unit: FaturapiUnit;
        consumerUnit: { id: string; name: string | null; client: ClientRef } | null;
        candidates: Array<{ id: string; name: string | null; client: ClientRef }>;
    }>;
    connections: Array<{ connection: FaturapiConnection; client: ClientRef | null }>;
    extractions: FaturapiExtraction[];
    events: Array<{
        eventId: string;
        type: string;
        status: 'received' | 'processed' | 'failed' | string;
        error: string | null;
        createdAt: string;
        processedAt: string | null;
    }>;
};

export type ClientFaturapiOverview = {
    connections: Array<{
        id: string;
        record: { faturapiConnectionId: string; status: string; source: string; credentialsHint: string | null };
        connection: FaturapiConnection | null;
        error: string | null;
    }>;
    units: Array<{
        consumerUnit: {
            id: string;
            name: string | null;
            clientNumber: string | null;
            plantId: string;
            faturapiUnitId: string | null;
            faturapiStatus: string | null;
            faturapiConnectionId: string | null;
        };
        unit: FaturapiUnit | null;
        extractions: FaturapiExtraction[];
        error: string | null;
    }>;
    plants: Array<{ id: string; name: string | null }>;
};

function errorMessage(error: unknown): string {
    const response = (error as { response?: { data?: { message?: string } } })?.response;
    return response?.data?.message ?? (error instanceof Error ? error.message : 'Operacao nao concluida');
}

async function unwrap<T>(request: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
    const response = await request;
    if (!response.data.success) throw new Error(response.data.message || 'Operacao nao concluida');
    return response.data.data;
}

const overviewKey = ['admin', 'faturapi', 'overview'] as const;
const clientKey = (clientId: string) => ['admin', 'faturapi', 'client', clientId] as const;

export function useFaturapiOverview() {
    const api = useAuthenticatedApi();
    return useQuery({
        queryKey: overviewKey,
        queryFn: () => unwrap<FaturapiOverview>(api.get('/admin/faturapi')),
        enabled: api.isAuthenticated,
        refetchInterval: 30_000,
    });
}

export function useClientFaturapi(clientId: string) {
    const api = useAuthenticatedApi();
    return useQuery({
        queryKey: clientKey(clientId),
        queryFn: () => unwrap<ClientFaturapiOverview>(api.get(`/admin/clients/${clientId}/faturapi`)),
        enabled: api.isAuthenticated && !!clientId,
        // Conexao sincronizando / extracao em andamento: atualiza sozinho.
        refetchInterval: (query) => {
            const data = query.state.data;
            const busy = data?.connections.some((c) => c.connection?.status === 'syncing')
                || data?.units.some((u) => u.extractions.some((e) => e.status === 'pending' || e.status === 'processing'));
            return busy ? 5_000 : false;
        },
    });
}

/** Mutation com toast e invalidacao das telas da Faturapi (e da lista de UCs do cliente). */
function useFaturapiMutation<V>(
    fn: (variables: V) => Promise<unknown>,
    success: string,
    clientId?: string,
) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: fn,
        onSuccess: () => {
            toast.success(success);
            void queryClient.invalidateQueries({ queryKey: ['admin', 'faturapi'] });
            // UCs criadas/vinculadas aparecem nas outras abas do cliente.
            if (clientId) void queryClient.invalidateQueries({ queryKey: ['admin-client-consumer-units', clientId] });
        },
        onError: (error) => toast.error(errorMessage(error)),
    });
}

export function useClientFaturapiActions(clientId: string) {
    const api = useAuthenticatedApi();
    const base = `/admin/clients/${clientId}`;

    return {
        createConnection: useFaturapiMutation(
            (data: { source: 'pessoa' | 'empresa'; credentials: FaturapiCredentials }) =>
                unwrap(api.post(`${base}/faturapi/connections`, data)),
            'Conexao criada. A Faturapi esta listando as UCs da conta.',
            clientId,
        ),
        syncConnection: useFaturapiMutation(
            (connectionId: string) => unwrap(api.post(`${base}/faturapi/connections/${connectionId}/sync`)),
            'Sincronizacao iniciada',
            clientId,
        ),
        updateConnectionCredentials: useFaturapiMutation(
            ({ connectionId, credentials }: { connectionId: string; credentials: FaturapiCredentials }) =>
                unwrap(api.patch(`${base}/faturapi/connections/${connectionId}`, { credentials })),
            'Senha atualizada. A conexao vai sincronizar de novo.',
            clientId,
        ),
        deleteConnection: useFaturapiMutation(
            (connectionId: string) => unwrap(api.delete(`${base}/faturapi/connections/${connectionId}`)),
            'Conexao removida',
            clientId,
        ),
        monitorUnits: useFaturapiMutation(
            ({ connectionId, ...data }: { connectionId: string; ucs: string[]; plantId?: string; backfill?: number }) =>
                unwrap(api.post(`${base}/faturapi/connections/${connectionId}/units`, data)),
            'UCs monitoradas',
            clientId,
        ),
        linkUnit: useFaturapiMutation(
            ({ unitId, ...data }: { unitId: string; source: 'pessoa' | 'empresa' | 'inbox'; credentials?: FaturapiCredentials; backfill?: number }) =>
                unwrap(api.post(`${base}/consumer-units/${unitId}/faturapi`, data)),
            'UC vinculada a Faturapi',
            clientId,
        ),
        updateUnit: useFaturapiMutation(
            ({ unitId, ...data }: { unitId: string; status?: 'active' | 'paused'; credentials?: FaturapiCredentials }) =>
                unwrap(api.patch(`${base}/consumer-units/${unitId}/faturapi`, data)),
            'Unidade atualizada',
            clientId,
        ),
        checkUnit: useFaturapiMutation(
            (unitId: string) => unwrap(api.post(`${base}/consumer-units/${unitId}/faturapi/check`)),
            'Busca iniciada. A fatura chega pelo webhook quando terminar.',
            clientId,
        ),
        backfillUnit: useFaturapiMutation(
            ({ unitId, months }: { unitId: string; months: number }) =>
                unwrap(api.post(`${base}/consumer-units/${unitId}/faturapi/backfill`, { months })),
            'Busca do historico iniciada',
            clientId,
        ),
        unlinkUnit: useFaturapiMutation(
            (unitId: string) => unwrap(api.delete(`${base}/consumer-units/${unitId}/faturapi`)),
            'UC desvinculada da Faturapi',
            clientId,
        ),
    };
}

export function useFaturapiOverviewActions() {
    const api = useAuthenticatedApi();
    return {
        reprocessEvent: useFaturapiMutation(
            (eventId: string) => unwrap(api.post(`/admin/faturapi/events/${eventId}/reprocess`)),
            'Evento enviado para reprocessar',
        ),
        assignConnection: useFaturapiMutation(
            ({ connectionId, clientId }: { connectionId: string; clientId: string }) =>
                unwrap(api.post(`/admin/faturapi/connections/${connectionId}/assign`, { clientId })),
            'Conexao ligada ao cliente',
        ),
        assignUnit: useFaturapiMutation(
            ({ unitId, consumerUnitId }: { unitId: string; consumerUnitId: string }) =>
                unwrap(api.post(`/admin/faturapi/units/${unitId}/assign`, { consumerUnitId })),
            'Unidade vinculada a UC',
        ),
    };
}
