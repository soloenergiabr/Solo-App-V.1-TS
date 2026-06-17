import { cn } from '@/lib/utils'
import { formatBRL } from '@/frontend/telemetry-kit'
import type { AccountBill } from '@/shared/controle/types'

type CostRow = { label: string; value: string }

function buildRows(bill: AccountBill): CostRow[] {
    const rows: CostRow[] = []
    if (bill.energyCost != null) rows.push({ label: 'Energia', value: formatBRL(bill.energyCost) })
    if (bill.tariffTusdValue != null) rows.push({ label: 'TUSD', value: formatBRL(bill.tariffTusdValue) })
    if (bill.tariffTeValue != null) rows.push({ label: 'TE', value: formatBRL(bill.tariffTeValue) })
    if (bill.icmsCost != null) rows.push({ label: 'ICMS', value: formatBRL(bill.icmsCost) })
    if (bill.publicLightingCost != null) rows.push({ label: 'Ilum. pública', value: formatBRL(bill.publicLightingCost) })
    if (bill.tariffFlag != null || bill.tariffFlagCost != null) {
        const flagLabel = bill.tariffFlag ? `Bandeira ${bill.tariffFlag}` : 'Bandeira'
        const flagValue = bill.tariffFlagCost != null ? formatBRL(bill.tariffFlagCost) : '—'
        rows.push({ label: flagLabel, value: flagValue })
    }
    return rows
}

export function CostBreakdown({ bill, className }: { bill: AccountBill; className?: string }) {
    const rows = buildRows(bill)
    const hasData = rows.length > 0 || bill.aiAnalysis

    if (!hasData) {
        return (
            <div data-slot="cost-breakdown" className={cn('rounded-2xl border bg-card p-4 text-sm text-muted-foreground', className)}>
                Sem detalhamento de custos disponível.
            </div>
        )
    }

    return (
        <div data-slot="cost-breakdown" className={cn('space-y-3 rounded-2xl border bg-card p-4', className)}>
            {rows.length > 0 && (
                <dl className="space-y-1">
                    {rows.map((row) => (
                        <div key={row.label} className="flex items-center justify-between text-sm">
                            <dt className="text-muted-foreground">{row.label}</dt>
                            <dd className="font-medium text-foreground">{row.value}</dd>
                        </div>
                    ))}
                </dl>
            )}
            {bill.aiAnalysis && (
                <p className="rounded-lg bg-muted/50 p-2 text-xs text-muted-foreground">IA: {bill.aiAnalysis}</p>
            )}
        </div>
    )
}
