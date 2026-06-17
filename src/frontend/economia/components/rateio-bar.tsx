import { cn } from '@/lib/utils'
import { formatPercent } from '@/frontend/telemetry-kit'
import type { RateioSlice } from '@/shared/controle/types'

const SWATCH = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5']

export function RateioBar({ slices, className }: { slices: RateioSlice[]; className?: string }) {
    return (
        <div data-slot="rateio-bar" className={cn('space-y-2 rounded-2xl border bg-card p-4', className)}>
            <span className="text-xs font-medium tracking-wide text-muted-foreground">RATEIO (distribuição de créditos)</span>
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                {slices.map((s, i) => (
                    <div key={s.toUnitId} className={cn('h-full', SWATCH[i % SWATCH.length])} style={{ width: `${s.percentage}%` }} />
                ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {slices.map((s, i) => (
                    <span key={s.toUnitId} className="flex items-center gap-1 text-muted-foreground">
                        <span className={cn('size-2 rounded-full', SWATCH[i % SWATCH.length])} />
                        {s.toUnitName} <span className="font-medium text-foreground">{formatPercent(s.percentage)}</span>
                    </span>
                ))}
            </div>
        </div>
    )
}
