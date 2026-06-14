import { cn } from "@/lib/utils"
import { calcPaybackPercent } from "../lib/calc"
import { formatBRL, formatPercent } from "../lib/format"

export function PaybackGauge({
    totalInvested,
    returned,
    payoffLabel,
    className,
}: {
    totalInvested: number
    returned: number
    payoffLabel?: string
    className?: string
}) {
    const percent = calcPaybackPercent({ totalInvested, returned })

    return (
        <div
            data-slot="payback-gauge"
            className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border bg-card p-6",
                className,
            )}
        >
            <span className="text-sm text-muted-foreground">Investimento pago</span>
            <span className="font-display text-5xl font-bold text-brand-gradient">
                {formatPercent(percent)}
            </span>
            <span className="text-sm text-foreground">
                {`${formatBRL(returned)} / ${formatBRL(totalInvested)}`}
            </span>
            {payoffLabel ? (
                <span className="text-xs text-muted-foreground">
                    {`quitação prevista: ${payoffLabel}`}
                </span>
            ) : null}
        </div>
    )
}
