'use client'

import { cn } from '@/lib/utils'
import { formatBRL, CopyPixButton } from '@/frontend/telemetry-kit'
import type { AccountBill } from '@/shared/controle/types'
import { resolveBillStatus, statusToBadge } from '../lib/bill-status'

const TONE: Record<'success' | 'warning' | 'destructive', string> = {
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
}

export function ContasAPagar({ bills, className }: { bills: AccountBill[]; className?: string }) {
    if (bills.length === 0) {
        return <div className={cn('rounded-2xl border bg-card p-4 text-sm text-muted-foreground', className)}>Sem faturas no período</div>
    }
    return (
        <div data-slot="contas-a-pagar" className={cn('space-y-2', className)}>
            {bills.map((b) => {
                const status = resolveBillStatus(b)
                const badge = statusToBadge(status)
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
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
