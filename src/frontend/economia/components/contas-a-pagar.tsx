'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatBRL, CopyPixButton } from '@/frontend/telemetry-kit'
import type { AccountBill } from '@/shared/controle/types'
import { resolveBillStatus, statusToBadge } from '../lib/bill-status'

const TONE: Record<'success' | 'warning' | 'destructive', string> = {
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
}

export function ContasAPagar({ bills, className }: { bills: AccountBill[]; className?: string }) {
    const [confirmingIds, setConfirmingIds] = useState<Set<string>>(new Set())
    const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set())
    const [errorMap, setErrorMap] = useState<Record<string, string>>({})

    // Filter out locally confirmed bills
    const visible = bills.filter((b) => !confirmedIds.has(b.id))

    async function handleConfirm(bill: AccountBill) {
        setConfirmingIds((prev) => new Set(prev).add(bill.id))
        setErrorMap((prev) => {
            const next = { ...prev }
            delete next[bill.id]
            return next
        })
        try {
            const res = await fetch(`/api/economia/bills/${bill.id}/confirm-payment`, {
                method: 'POST',
            })
            const json = await res.json()
            if (!res.ok || !json.success) {
                setErrorMap((prev) => ({ ...prev, [bill.id]: json.message ?? 'Falha ao confirmar pagamento' }))
                return
            }
            setConfirmedIds((prev) => new Set(prev).add(bill.id))
        } catch (err) {
            setErrorMap((prev) => ({ ...prev, [bill.id]: err instanceof Error ? err.message : 'Erro inesperado' }))
        } finally {
            setConfirmingIds((prev) => {
                const next = new Set(prev)
                next.delete(bill.id)
                return next
            })
        }
    }

    if (visible.length === 0 && confirmedIds.size === 0) {
        return <div className={cn('rounded-2xl border bg-card p-4 text-sm text-muted-foreground', className)}>Sem faturas no período</div>
    }

    // Show a different message when all bills were just paid
    if (visible.length === 0 && confirmedIds.size > 0) {
        return (
            <div className={cn('space-y-2', className)}>
                <div className="rounded-2xl border bg-success/10 border-success/20 p-4 flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-success" />
                    <span className="text-sm text-success font-medium">Todas as faturas foram pagas</span>
                </div>
            </div>
        )
    }

    return (
        <div data-slot="contas-a-pagar" className={cn('space-y-2', className)}>
            {visible.map((b) => {
                const status = resolveBillStatus(b)
                const badge = statusToBadge(status)
                const isConfirming = confirmingIds.has(b.id)
                const confirmError = errorMap[b.id]
                return (
                    <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4">
                        <div className="min-w-0">
                            <div className="font-medium text-foreground">{b.consumerUnitName}</div>
                            <div className="text-xs text-muted-foreground">
                                <span>{formatBRL(b.amountDue)}</span>
                                {' · '}
                                <span>{b.dueDate ? `vence ${new Date(b.dueDate).toLocaleDateString('pt-BR')}` : 'sem vencimento'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={cn('text-xs font-medium', TONE[badge.tone])}>{badge.label}</span>
                            {status !== 'paga' && b.pixCode ? <CopyPixButton code={b.pixCode} /> : null}
                            {status !== 'paga' && (
                                <div className="flex flex-col items-end gap-1">
                                    <Button
                                        onClick={() => handleConfirm(b)}
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
                                        <span className="text-xs text-destructive max-w-40 text-right">{confirmError}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
