'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FileText, CheckCircle2, Loader2 } from 'lucide-react'
import { formatBRL, CopyPixButton } from '@/frontend/telemetry-kit'
import type { AccountBill } from '@/shared/controle/types'
import { resolveBillStatus, statusToBadge } from '../lib/bill-status'

const TONE = { success: 'text-success', warning: 'text-warning', destructive: 'text-destructive' } as const

export function AccountCard({ bill, className }: { bill: AccountBill; className?: string }) {
    const [isConfirming, setIsConfirming] = useState(false)
    const [confirmError, setConfirmError] = useState<string | null>(null)
    const [isConfirmed, setIsConfirmed] = useState(false)

    const status = isConfirmed ? 'paga' : resolveBillStatus(bill)
    const badge = statusToBadge(status)

    async function handleConfirm() {
        setIsConfirming(true)
        setConfirmError(null)
        try {
            const res = await fetch(`/api/economia/bills/${bill.id}/confirm-payment`, {
                method: 'POST',
            })
            const json = await res.json()
            if (!res.ok || !json.success) {
                setConfirmError(json.message ?? 'Falha ao confirmar pagamento')
                return
            }
            setIsConfirmed(true)
        } catch (err) {
            setConfirmError(err instanceof Error ? err.message : 'Erro inesperado')
        } finally {
            setIsConfirming(false)
        }
    }

    return (
        <div data-slot="account-card" className={cn('space-y-3 rounded-2xl border bg-card p-4', className)}>
            <div className="flex items-start justify-between gap-2">
                <div>
                    <div className="font-display font-semibold text-foreground">{bill.consumerUnitName}</div>
                    <div className="text-xs text-muted-foreground">
                        {bill.distributor ?? '—'} · {bill.accountNumber ?? '—'}
                    </div>
                </div>
                <span className={cn('text-xs font-medium', TONE[badge.tone])}>{badge.label}</span>
            </div>

            <div className="text-xs text-muted-foreground">
                Titular: <span className="text-foreground">{bill.titularName ?? '—'}</span>
                {bill.payerName ? <> · Paga: <span className="text-foreground">{bill.payerName}</span></> : null}
            </div>

            <div className="flex items-baseline justify-between">
                <span className="font-display text-2xl font-semibold text-foreground">{formatBRL(bill.amountDue)}</span>
                <span className="text-xs text-success">economia {formatBRL(bill.estimatedSavings)}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Button asChild variant="outline" size="sm">
                    <Link href={`/economia/${bill.id}`}>
                        <FileText className="size-3.5" />
                        Detalhes
                    </Link>
                </Button>
                {status !== 'paga' && bill.pixCode && <CopyPixButton code={bill.pixCode} />}
                {status !== 'paga' && (
                    <div className="flex flex-col gap-1">
                        <Button
                            onClick={handleConfirm}
                            disabled={isConfirming}
                            variant="outline"
                            size="sm"
                        >
                            {isConfirming ? (
                                <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                                <CheckCircle2 className="size-3.5" />
                            )}
                            <span className="ml-1">Pagar</span>
                        </Button>
                        {confirmError && (
                            <span className="text-xs text-destructive max-w-32">{confirmError}</span>
                        )}
                    </div>
                )}
                {isConfirmed && (
                    <span className="flex items-center gap-1 text-xs text-success font-medium">
                        <CheckCircle2 className="size-3.5" />
                        Paga
                    </span>
                )}
            </div>
        </div>
    )
}
