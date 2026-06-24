import { useCallback, useEffect, useState } from 'react'
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi'
import type { AccountBill } from '@/shared/controle/types'

export function useEconomia(params: { year?: number; month?: number }) {
    const api = useAuthenticatedApi()
    const [bills, setBills] = useState<AccountBill[] | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    // Bumping this key re-runs the fetch effect (used by refetch() after a submit).
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        if (!api.isAuthenticated) return
        const qs = new URLSearchParams()
        qs.append('year', String(params.year ?? new Date().getFullYear()))
        if (params.month) qs.append('month', String(params.month))
        setIsLoading(true)
        setError(null)
        api.get(`/economia/bills?${qs.toString()}`)
            .then((res) => {
                if (res.data.success) setBills(res.data.data)
                else setError(res.data.message || 'Falha ao carregar contas')
            })
            .catch((e) => setError(e?.response?.data?.message || 'Erro ao carregar contas'))
            .finally(() => setIsLoading(false))
    }, [api.isAuthenticated, params.year, params.month, reloadKey])

    const refetch = useCallback(() => setReloadKey((k) => k + 1), [])

    return { bills, isLoading, error, refetch }
}
