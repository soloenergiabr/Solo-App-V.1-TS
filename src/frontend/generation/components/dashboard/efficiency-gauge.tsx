import { cn } from '@/lib/utils'
import { formatPercent } from '@/frontend/telemetry-kit'

export function EfficiencyGauge({ percent, className }: { percent: number; className?: string }) {
    const value = Math.max(0, Math.min(100, Math.round(percent)))
    return (
        <div
            data-slot="efficiency-gauge"
            className={cn('flex flex-col gap-1 rounded-2xl border bg-card p-4', className)}
        >
            <span className="text-xs font-medium tracking-wide text-muted-foreground">EFICIÊNCIA</span>
            <span className="font-display text-2xl font-semibold text-foreground">{formatPercent(value)}</span>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-brand-gradient-90" style={{ width: `${value}%` }} />
            </div>
        </div>
    )
}
