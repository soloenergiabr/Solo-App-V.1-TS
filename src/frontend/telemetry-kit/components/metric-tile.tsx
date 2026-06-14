import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function MetricTile({
    label,
    value,
    sublabel,
    icon,
    className,
}: {
    label: string
    value: ReactNode
    sublabel?: ReactNode
    icon?: ReactNode
    className?: string
}) {
    return (
        <div
            data-slot="metric-tile"
            className={cn(
                "flex flex-col gap-1 rounded-2xl border bg-card p-4",
                className,
            )}
        >
            <span className="flex items-center gap-1 text-xs font-medium tracking-wide text-muted-foreground">
                {icon}
                {label}
            </span>
            <span className="font-display text-2xl font-semibold text-foreground">
                {value}
            </span>
            {sublabel ? (
                <span className="text-xs text-muted-foreground">{sublabel}</span>
            ) : null}
        </div>
    )
}
