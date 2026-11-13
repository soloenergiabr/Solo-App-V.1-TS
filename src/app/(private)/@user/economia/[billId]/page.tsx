'use client'

import { use, useEffect, useState } from 'react'
import { BillAnalysisScreen } from '@/frontend/economia/analysis/bill-analysis-screen'
import type { BillDetail } from '@/frontend/economia/analysis/types'
import { apiErrorMessage, useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi'

export default function BillAnalysisPage({
    params,
}: {
    params: Promise<{ billId: string }>
}) {
    const { billId } = use(params)
    const api = useAuthenticatedApi()
    const [bill, setBill] = useState<BillDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!api.isAuthenticated) return
        let cancelled = false

        async function fetchBill() {
            setIsLoading(true)
            setError(null)

            try {
                const { data: json } = await api.get(`/economia/bills/${billId}`)
                if (cancelled) return
                setBill(json.data as BillDetail)
            } catch (err) {
                if (!cancelled) {
                    setError(apiErrorMessage(err, 'Não foi possível carregar a fatura.'))
                }
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        }

        fetchBill()

        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [billId, api.isAuthenticated])

    return (
        <BillAnalysisScreen
            bill={bill}
            isLoading={isLoading}
            error={error}
        />
    )
}
