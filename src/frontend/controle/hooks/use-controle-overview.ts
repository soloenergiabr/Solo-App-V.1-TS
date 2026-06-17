import { useEffect, useState } from 'react'
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi'
import type { ControleOverview } from '@/shared/controle/types'

export function useControleOverview() {
    const api = useAuthenticatedApi()
    const [overview, setOverview] = useState<ControleOverview | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!api.isAuthenticated) return
        setIsLoading(true)
        api.get('/controle/overview')
            .then((res) => {
                if (res.data.success) setOverview(res.data.data)
                else setError(res.data.message || 'Falha ao carregar visão geral')
            })
            .catch((e) => setError(e?.response?.data?.message || 'Erro ao carregar visão geral'))
            .finally(() => setIsLoading(false))
    }, [api.isAuthenticated])

    return { overview, isLoading, error }
}
