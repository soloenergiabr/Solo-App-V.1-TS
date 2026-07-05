'use client';

import { UseQueryOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';

export type ApprovalItem = {
    type: 'plant' | 'consumer_unit';
    id: string;
    name: string;
    clientName: string;
    clientId: string;
    createdAt: string;
    validationStatus: string;
    rejectionReason: string | null;
};

type ApiEnvelope<T> = {
    success: boolean;
    data: T;
    message?: string;
};

export const adminApprovalsQueryKey = ['admin-approvals'] as const;

type AdminApprovalsOptions<TData> = Omit<
    UseQueryOptions<ApprovalItem[], Error, TData, typeof adminApprovalsQueryKey>,
    'queryKey' | 'queryFn'
>;

export function useAdminApprovals<TData = ApprovalItem[]>(options?: AdminApprovalsOptions<TData>) {
    const api = useAuthenticatedApi();
    const { enabled, ...queryOptions } = options ?? {};

    return useQuery({
        queryKey: adminApprovalsQueryKey,
        queryFn: async () => {
            const response = await api.get<ApiEnvelope<ApprovalItem[]>>('/admin/approvals');
            return response.data.data;
        },
        ...queryOptions,
        enabled: api.isAuthenticated && (enabled ?? true),
        refetchInterval: 30_000,
    });
}

export function useInvalidateAdminApprovals() {
    const queryClient = useQueryClient();

    return () => queryClient.invalidateQueries({ queryKey: adminApprovalsQueryKey });
}
