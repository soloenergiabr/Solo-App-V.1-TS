import { cn } from '@/lib/utils'
import { formatBRL, formatKwh } from '@/frontend/telemetry-kit'

export function LifetimeStrip({
    totalGeneratedKwh, totalReturn, monthsActive, co2AvoidedTons, className,
}: {
    totalGeneratedKwh: number; totalReturn: number; monthsActive: number; co2AvoidedTons: number; className?: string
}) {
    return (
        <div data-slot="lifetime-strip" className={cn('rounded-2xl border bg-card p-4', className)}>
            <span className="text-xs font-medium tracking-wide text-muted-foreground">VIDA TODA</span>
            <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                <div>▸ <span className="font-medium text-foreground">{formatKwh(totalGeneratedKwh)}</span> gerados</div>
                <div>▸ <span className="font-medium text-foreground">{formatBRL(totalReturn)}</span> retorno</div>
                <div>▸ <span className="font-medium text-foreground">{monthsActive} meses</span> ativo</div>
                <div>▸ <span className="font-medium text-foreground">{co2AvoidedTons.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} t</span> CO₂ evitado</div>
            </div>
        </div>
    )
}
