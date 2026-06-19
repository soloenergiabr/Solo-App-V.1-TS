'use client'

import { use, useEffect, useState } from 'react'
import { BillAnalysisScreen } from '@/frontend/economia/analysis/bill-analysis-screen'
import type { BillDetail } from '@/frontend/economia/analysis/types'

export default function BillAnalysisPage({
    params,
}: {
    params: Promise<{ billId: string }>
}) {
    const { billId } = use(params)
    const [bill, setBill] = useState<BillDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        async function fetchBill() {
            setIsLoading(true)
            setError(null)

            try {
                const res = await fetch(`/api/economia/bills/${billId}`)
                const json = await res.json()

                if (cancelled) return

                if (!res.ok || !json.success) {
                    setError(json.message ?? 'Falha ao carregar fatura')
                    return
                }

                setBill(json.data as BillDetail)
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Erro inesperado')
                }
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        }

        fetchBill()

        return () => {
            cancelled = true
        }
    }, [billId])

    return (
        <BillAnalysisScreen
            bill={bill}
            isLoading={isLoading}
            error={error}
        />
    )
}
