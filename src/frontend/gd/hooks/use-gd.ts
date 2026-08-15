'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi'
import type {
    ChargeMode,
    ChargeRuleDTO,
    GdOverview,
    PayerInviteDTO,
} from '@/shared/gd/types'

/**
 * Hooks da geracao distribuida. `clientId` so e enviado quando um admin opera
 * em nome de um cliente (o espelho do admin); o titular sempre omite.
 */

function scopedUrl(path: string, clientId?: string): string {
    return clientId ? `${path}${path.includes('?') ? '&' : '?'}clientId=${clientId}` : path
}

const gdKeys = {
    charges: (year: number, month: number, clientId?: string) =>
        ['gd', 'charges', year, month, clientId ?? 'self'] as const,
    rules: (clientId?: string) => ['gd', 'charge-rules', clientId ?? 'self'] as const,
    invites: (clientId?: string) => ['gd', 'invites', clientId ?? 'self'] as const,
}

export function useCharges(year: number, month: number, clientId?: string) {
    const api = useAuthenticatedApi()

    return useQuery({
        queryKey: gdKeys.charges(year, month, clientId),
        queryFn: async () => {
            const res = await api.get(scopedUrl(`/gd/charges?year=${year}&month=${month}`, clientId))
            if (!res.data.success) throw new Error(res.data.message || 'Falha ao carregar cobrancas')
            return res.data.data as GdOverview
        },
        enabled: api.isAuthenticated,
    })
}

export function useChargeRules(clientId?: string) {
    const api = useAuthenticatedApi()

    return useQuery({
        queryKey: gdKeys.rules(clientId),
        queryFn: async () => {
            const res = await api.get(scopedUrl('/gd/charge-rules', clientId))
            if (!res.data.success) throw new Error(res.data.message || 'Falha ao carregar regras')
            return res.data.data as ChargeRuleDTO[]
        },
        enabled: api.isAuthenticated,
    })
}

export interface SaveChargeRuleInput {
    consumerUnitId: string
    mode: ChargeMode
    pricePerKwh?: number | null
    fixedAmount?: number | null
    dueDayOfMonth?: number | null
    isActive?: boolean
    notes?: string | null
}

export function useSaveChargeRule(clientId?: string) {
    const api = useAuthenticatedApi()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (input: SaveChargeRuleInput) => {
            const res = await api.post(scopedUrl('/gd/charge-rules', clientId), input)
            if (!res.data.success) throw new Error(res.data.message || 'Falha ao salvar a regra')
            return res.data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: gdKeys.rules(clientId) })
            queryClient.invalidateQueries({ queryKey: ['gd', 'charges'] })
        },
    })
}

export function useGenerateCharges(clientId?: string) {
    const api = useAuthenticatedApi()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (input: { referenceYear: number; referenceMonth: number }) => {
            const res = await api.post(scopedUrl('/gd/charges/generate', clientId), input)
            if (!res.data.success) throw new Error(res.data.message || 'Falha ao gerar cobrancas')
            return res.data.data as {
                created: number
                updated: number
                skipped: number
                errors: Array<{ consumerUnitId: string; consumerUnitName: string; message: string }>
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gd', 'charges'] })
        },
    })
}

export function useSendCharge(clientId?: string) {
    const api = useAuthenticatedApi()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (chargeId: string) => {
            const res = await api.post(scopedUrl(`/gd/charges/${chargeId}/send`, clientId))
            if (!res.data.success) throw new Error(res.data.message || 'Falha ao enviar a cobranca')
            return res.data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gd', 'charges'] })
        },
    })
}

export function useConfirmChargePayment(clientId?: string) {
    const api = useAuthenticatedApi()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (chargeId: string) => {
            const res = await api.post(
                scopedUrl(`/gd/charges/${chargeId}/confirm-payment`, clientId),
            )
            if (!res.data.success) throw new Error(res.data.message || 'Falha ao confirmar pagamento')
            return res.data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gd', 'charges'] })
        },
    })
}

export function usePayerInvites(clientId?: string) {
    const api = useAuthenticatedApi()

    return useQuery({
        queryKey: gdKeys.invites(clientId),
        queryFn: async () => {
            const res = await api.get(scopedUrl('/gd/invites', clientId))
            if (!res.data.success) throw new Error(res.data.message || 'Falha ao carregar convites')
            return res.data.data as PayerInviteDTO[]
        },
        enabled: api.isAuthenticated,
    })
}

export function useInvitePayer(clientId?: string) {
    const api = useAuthenticatedApi()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (input: { consumerUnitId: string; name: string; email: string }) => {
            const res = await api.post(scopedUrl('/gd/invites', clientId), input)
            if (!res.data.success) throw new Error(res.data.message || 'Falha ao enviar o convite')
            return res.data.data as PayerInviteDTO
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: gdKeys.invites(clientId) })
            queryClient.invalidateQueries({ queryKey: gdKeys.rules(clientId) })
        },
    })
}

export function useRevokeInvite(clientId?: string) {
    const api = useAuthenticatedApi()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (inviteId: string) => {
            const res = await api.delete(scopedUrl(`/gd/invites/${inviteId}`, clientId))
            if (!res.data.success) throw new Error(res.data.message || 'Falha ao cancelar o convite')
            return res.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: gdKeys.invites(clientId) })
        },
    })
}
