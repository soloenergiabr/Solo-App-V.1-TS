import { cn } from "@/lib/utils"
import { statusToColor, type TelemetryStatus } from "../lib/status"

const LABEL: Record<TelemetryStatus, string> = {
    ok: "normal",
    warning: "atenção",
    critical: "crítico",
    unknown: "desconhecido",
}

const BORDER: Record<TelemetryStatus, string> = {
    ok: "border-success/60 shadow-success/20",
    warning: "border-warning/60 shadow-warning/20",
    critical: "border-destructive/60 shadow-destructive/20",
    unknown: "border-muted-foreground/40 shadow-muted-foreground/10",
}

export function StatusRing({
    label,
    status,
    className,
}: {
    label: string
    status: TelemetryStatus
    className?: string
}) {
    return (
        <div
            data-slot="status-ring"
            data-testid="status-ring"
            data-status={status}
            aria-label={`${label}: ${LABEL[status]}`}
            className={cn(
                "inline-flex size-24 flex-col items-center justify-center rounded-full border bg-card text-center shadow-[0_0_24px]",
                BORDER[status],
                className,
            )}
        >
            <span className={cn("size-2 rounded-full bg-current", statusToColor(status))} />
            <span className="mt-2 text-sm font-medium text-foreground">{label}</span>
        </div>
    )
}
