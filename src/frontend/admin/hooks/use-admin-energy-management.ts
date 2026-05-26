'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';

type ApiEnvelope<T> = {
    success: boolean;
    data: T;
    message?: string;
};

async function unwrapMutation<T>(request: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
    const response = await request;
    if (!response.data.success) {
        throw new Error(response.data.message || 'Operacao nao concluida');
    }
    return response.data.data;
}

export type AdminPlant = {
    id: string;
    clientId: string;
    name?: string | null;
    provider?: string | null;
    providerStatus?: string | null;
    providerPlantId?: string | null;
    installedPowerKw?: number | string | null;
    totalEnergyKwh?: number | string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    timezone?: string | null;
    latitude?: number | string | null;
    longitude?: number | string | null;
    _count?: {
        inverters: number;
        consumerUnits: number;
        creditAllocations: number;
        energyBills: number;
    };
};

export type AdminConsumerUnit = {
    id: string;
    clientId: string;
    plantId: string;
    name?: string | null;
    isGenerator: boolean;
    isConsumer: boolean;
    accountHolder?: string | null;
    accountNumber?: string | null;
    clientNumber?: string | null;
    installationNumber?: string | null;
    distributor?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    status?: string | null;
    plant?: Pick<AdminPlant, 'id' | 'name' | 'providerPlantId'>;
};

export type AdminCreditAllocation = {
    id: string;
    clientId: string;
    plantId: string;
    fromId: string;
    toId: string;
    allocationPercentage: number | string;
    startsAt?: string | null;
    endsAt?: string | null;
    isActive: boolean;
    plant?: Pick<AdminPlant, 'id' | 'name'>;
    from?: Pick<AdminConsumerUnit, 'id' | 'name' | 'clientNumber' | 'installationNumber'>;
    to?: Pick<AdminConsumerUnit, 'id' | 'name' | 'clientNumber' | 'installationNumber'>;
};

export type AdminEnergyBill = {
    id: string;
    clientId: string;
    plantId: string;
    consumerUnitId: string;
    competenceDate: string;
    referenceMonth: number;
    referenceYear: number;
    billFileUrl?: string | null;
    accountHolder?: string | null;
    distributor?: string | null;
    consumptionKwh?: number | string | null;
    billedConsumptionKwh?: number | string | null;
    injectedEnergyKwh?: number | string | null;
    compensatedEnergyKwh?: number | string | null;
    currentCreditsKwh?: number | string | null;
    totalBillValue?: number | string | null;
    totalAmount?: number | string | null;
    tariffPerKwh?: number | string | null;
    estimatedSavings?: number | string | null;
    aiAnalysis?: string | null;
    alerts?: unknown;
    aiRecommendations?: unknown;
    status?: string | null;
    plant?: Pick<AdminPlant, 'id' | 'name'>;
    consumerUnit?: Pick<AdminConsumerUnit, 'id' | 'name' | 'clientNumber' | 'installationNumber'>;
};

export type AdminInverter = {
    id: string;
    name?: string | null;
    provider: string;
    providerId: string;
    clientId?: string;
    plantId?: string;
    providerPlantId?: string;
    providerPlantName?: string;
    providerStatus?: string;
    serialNumber?: string;
    manufacturer?: string;
    modelName?: string;
    firmwareVersion?: string;
    nominalPowerKw?: number;
    timezone?: string;
    syncEnabled: boolean;
    syncIntervalMinutes?: number;
    lastSyncStatus?: string;
    lastSyncError?: string;
};

export type AdminClientDetails = {
    client: {
        id: string;
        name: string;
        email: string;
        cpfCnpj: string;
        phone?: string | null;
        address?: string | null;
        avgEnergyCost?: number | null;
        indicationCode: string;
        status: string;
        createdAt: string;
        updatedAt: string;
    };
    balance: number;
    inverters: AdminInverter[];
};

export type ProviderPlantOption = {
    id: string;
    name: string;
    status?: string;
    location?: unknown;
    capacityKw?: number;
    totalEnergyKwh?: number;
    raw?: unknown;
};

const adminEnergyKeys = {
    client: (clientId: string) => ['admin-client', clientId] as const,
    plants: (clientId: string) => ['admin-client-plants', clientId] as const,
    consumerUnits: (clientId: string) => ['admin-client-consumer-units', clientId] as const,
    allocations: (clientId: string) => ['admin-client-credit-allocations', clientId] as const,
    bills: (clientId: string) => ['admin-client-energy-bills', clientId] as const,
    providerPlants: (provider?: string) => ['admin-provider-plants', provider || ''] as const,
};

function useInvalidateClientEnergy(clientId: string) {
    const queryClient = useQueryClient();

    return () => void Promise.all([
        queryClient.invalidateQueries({ queryKey: adminEnergyKeys.client(clientId) }),
        queryClient.invalidateQueries({ queryKey: adminEnergyKeys.plants(clientId) }),
        queryClient.invalidateQueries({ queryKey: adminEnergyKeys.consumerUnits(clientId) }),
        queryClient.invalidateQueries({ queryKey: adminEnergyKeys.allocations(clientId) }),
        queryClient.invalidateQueries({ queryKey: adminEnergyKeys.bills(clientId) }),
        queryClient.invalidateQueries({ queryKey: ['generation-dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['consumption-dashboard'] }),
    ]);
}

export function useAdminClientDetails(clientId: string) {
    const api = useAuthenticatedApi();

    return useQuery({
        queryKey: adminEnergyKeys.client(clientId),
        queryFn: async () => {
            const response = await api.get<ApiEnvelope<AdminClientDetails>>(`/admin/clients/${clientId}`);
            return response.data.data;
        },
        enabled: api.isAuthenticated && Boolean(clientId),
    });
}

export function useAdminPlants(clientId: string) {
    const api = useAuthenticatedApi();
    const invalidate = useInvalidateClientEnergy(clientId);

    const query = useQuery({
        queryKey: adminEnergyKeys.plants(clientId),
        queryFn: async () => {
            const response = await api.get<ApiEnvelope<AdminPlant[]>>(`/admin/clients/${clientId}/plants`);
            return response.data.data;
        },
        enabled: api.isAuthenticated && Boolean(clientId),
    });

    const create = useMutation({
        mutationFn: async (data: Partial<AdminPlant>) => unwrapMutation<AdminPlant>(api.post(`/admin/clients/${clientId}/plants`, data)),
        onSuccess: invalidate,
    });

    const update = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<AdminPlant> }) => (
            unwrapMutation<AdminPlant>(api.put(`/admin/clients/${clientId}/plants/${id}`, data))
        ),
        onSuccess: invalidate,
    });

    const remove = useMutation({
        mutationFn: async (id: string) => unwrapMutation<unknown>(api.delete(`/admin/clients/${clientId}/plants/${id}`)),
        onSuccess: invalidate,
    });

    return { ...query, plants: query.data ?? [], create, update, remove };
}

export function useAdminConsumerUnits(clientId: string) {
    const api = useAuthenticatedApi();
    const invalidate = useInvalidateClientEnergy(clientId);

    const query = useQuery({
        queryKey: adminEnergyKeys.consumerUnits(clientId),
        queryFn: async () => {
            const response = await api.get<ApiEnvelope<AdminConsumerUnit[]>>(`/admin/clients/${clientId}/consumer-units`);
            return response.data.data;
        },
        enabled: api.isAuthenticated && Boolean(clientId),
    });

    const create = useMutation({
        mutationFn: async (data: Partial<AdminConsumerUnit>) => unwrapMutation<AdminConsumerUnit>(api.post(`/admin/clients/${clientId}/consumer-units`, data)),
        onSuccess: invalidate,
    });

    const update = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<AdminConsumerUnit> }) => (
            unwrapMutation<AdminConsumerUnit>(api.put(`/admin/clients/${clientId}/consumer-units/${id}`, data))
        ),
        onSuccess: invalidate,
    });

    const remove = useMutation({
        mutationFn: async (id: string) => unwrapMutation<unknown>(api.delete(`/admin/clients/${clientId}/consumer-units/${id}`)),
        onSuccess: invalidate,
    });

    return { ...query, consumerUnits: query.data ?? [], create, update, remove };
}

export function useAdminCreditAllocations(clientId: string) {
    const api = useAuthenticatedApi();
    const invalidate = useInvalidateClientEnergy(clientId);

    const query = useQuery({
        queryKey: adminEnergyKeys.allocations(clientId),
        queryFn: async () => {
            const response = await api.get<ApiEnvelope<AdminCreditAllocation[]>>(`/admin/clients/${clientId}/credit-allocations`);
            return response.data.data;
        },
        enabled: api.isAuthenticated && Boolean(clientId),
    });

    const create = useMutation({
        mutationFn: async (data: Partial<AdminCreditAllocation>) => unwrapMutation<AdminCreditAllocation>(api.post(`/admin/clients/${clientId}/credit-allocations`, data)),
        onSuccess: invalidate,
    });

    const update = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<AdminCreditAllocation> }) => (
            unwrapMutation<AdminCreditAllocation>(api.put(`/admin/clients/${clientId}/credit-allocations/${id}`, data))
        ),
        onSuccess: invalidate,
    });

    const remove = useMutation({
        mutationFn: async (id: string) => unwrapMutation<unknown>(api.delete(`/admin/clients/${clientId}/credit-allocations/${id}`)),
        onSuccess: invalidate,
    });

    return { ...query, allocations: query.data ?? [], create, update, remove };
}

export function useAdminEnergyBills(clientId: string) {
    const api = useAuthenticatedApi();
    const invalidate = useInvalidateClientEnergy(clientId);

    const query = useQuery({
        queryKey: adminEnergyKeys.bills(clientId),
        queryFn: async () => {
            const response = await api.get<ApiEnvelope<AdminEnergyBill[]>>(`/admin/clients/${clientId}/energy-bills`);
            return response.data.data;
        },
        enabled: api.isAuthenticated && Boolean(clientId),
    });

    const save = useMutation({
        mutationFn: async (data: Partial<AdminEnergyBill>) => unwrapMutation<AdminEnergyBill>(api.post(`/admin/clients/${clientId}/energy-bills`, data)),
        onSuccess: invalidate,
    });

    const update = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<AdminEnergyBill> }) => (
            unwrapMutation<AdminEnergyBill>(api.put(`/admin/clients/${clientId}/energy-bills/${id}`, data))
        ),
        onSuccess: invalidate,
    });

    const remove = useMutation({
        mutationFn: async (id: string) => unwrapMutation<unknown>(api.delete(`/admin/clients/${clientId}/energy-bills/${id}`)),
        onSuccess: invalidate,
    });

    const importBill = useMutation({
        mutationFn: async ({ file, consumerUnitId }: { file: File; consumerUnitId: string }) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('consumerUnitId', consumerUnitId);
            return unwrapMutation<AdminEnergyBill>(api.post(`/admin/clients/${clientId}/energy-bills/import`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 60000,
            }));
        },
        onSuccess: invalidate,
    });

    return { ...query, bills: query.data ?? [], save, update, remove, importBill };
}

export function useAdminInverters(clientId: string) {
    const api = useAuthenticatedApi();
    const invalidate = useInvalidateClientEnergy(clientId);

    const create = useMutation({
        mutationFn: async (data: Partial<AdminInverter>) => unwrapMutation<AdminInverter>(api.post('/admin/inverters', { ...data, clientId })),
        onSuccess: invalidate,
    });

    const update = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<AdminInverter> }) => unwrapMutation<AdminInverter>(api.put(`/admin/inverters/${id}`, data)),
        onSuccess: invalidate,
    });

    const remove = useMutation({
        mutationFn: async (id: string) => unwrapMutation<unknown>(api.delete(`/admin/inverters/${id}`)),
        onSuccess: invalidate,
    });

    return { create, update, remove };
}

export function useAdminProviderPlants(provider?: string) {
    const api = useAuthenticatedApi();

    return useQuery({
        queryKey: adminEnergyKeys.providerPlants(provider),
        queryFn: async () => {
            const response = await api.get<ApiEnvelope<ProviderPlantOption[]>>(`/admin/inverters/plants?provider=${provider}`);
            return response.data.data;
        },
        enabled: api.isAuthenticated && Boolean(provider) && provider !== 'other' && provider !== 'growatt',
    });
}
