import { useCallback, useEffect, useState } from 'react'
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi'
import type { AccountBill } from '@/shared/controle/types'

export function useBillHistory() {
    const api = useAuthenticatedApi()
    const [bills, setBills] = useState<AccountBill[] | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        if (!api.isAuthenticated) return
        setIsLoading(true)
        setError(null)
        api.get('/economia/bills?year=all')
            .then((res) => {
                if (res.data.success) setBills(res.data.data)
                else setError(res.data.message || 'Falha ao carregar contas')
            })
            .catch((e) => setError(e?.response?.data?.message || 'Erro ao carregar contas'))
            .finally(() => setIsLoading(false))
    }, [api.isAuthenticated, reloadKey])

    const refetch = useCallback(() => setReloadKey((k) => k + 1), [])

    return { bills, isLoading, error, refetch }
}
