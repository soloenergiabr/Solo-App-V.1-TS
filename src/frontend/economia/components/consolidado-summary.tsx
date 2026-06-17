import { cn } from '@/lib/utils'
import { formatBRL, formatKwh, formatPercent } from '@/frontend/telemetry-kit'
import type { EconomyConsolidated } from '@/shared/controle/types'

export function ConsolidadoSummary({ data, className }: { data: EconomyConsolidated; className?: string }) {
    return (
        <div data-slot="consolidado-summary" className={cn('rounded-2xl border bg-card p-4', className)}>
            <div className="flex flex-wrap items-baseline gap-2 text-sm text-muted-foreground">
                <span>Você pagaria <span className="font-medium text-foreground">{formatBRL(data.wouldPay)}</span></span>
                <span className="text-muted-foreground/50">→</span>
                <span>
                    Você paga{' '}
                    <span className="font-display text-2xl font-semibold text-foreground">
                        {formatBRL(data.actuallyPay)}
                    </span>
                </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>
                    Economia{' '}
                    <span className="font-medium text-success">
                        {formatBRL(data.savedAmount)} ({formatPercent(data.savedPercent)})
                    </span>
                </span>
                <span>
                    Créditos{' '}
                    <span className="font-medium text-foreground">+{formatKwh(data.creditsKwh)}</span>
                </span>
            </div>
        </div>
    )
}
