'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import { formatBRL, CopyPixButton } from '@/frontend/telemetry-kit'
import type { AccountBill } from '@/shared/controle/types'
import { resolveBillStatus, statusToBadge } from '../lib/bill-status'

const TONE = { success: 'text-success', warning: 'text-warning', destructive: 'text-destructive' } as const

export function AccountCard({ bill, className }: { bill: AccountBill; className?: string }) {
    const status = resolveBillStatus(bill)
    const badge = statusToBadge(status)
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

            {bill.aiAnalysis ? (
                <p className="rounded-lg bg-muted/50 p-2 text-xs text-muted-foreground">IA: {bill.aiAnalysis}</p>
            ) : null}

            <div className="flex flex-wrap gap-2">
                {status !== 'paga' && bill.pixCode ? <CopyPixButton code={bill.pixCode} /> : null}
                <Link href={`/economia/${bill.id}`}>
                    <Button variant="outline" size="sm">Ver analise</Button>
                </Link>
                {bill.billFileUrl ? (
                    <Button asChild variant="secondary" size="sm">
                        <a href={bill.billFileUrl} target="_blank" rel="noreferrer"><FileText className="size-4" /> PDF</a>
                    </Button>
                ) : null}
            </div>
        </div>
    )
}
