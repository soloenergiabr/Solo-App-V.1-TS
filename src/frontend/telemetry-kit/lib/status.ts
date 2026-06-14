export type TelemetryStatus = 'ok' | 'warning' | 'critical' | 'unknown'

const COLOR: Record<TelemetryStatus, string> = {
    ok: 'text-success',
    warning: 'text-warning',
    critical: 'text-destructive',
    unknown: 'text-muted-foreground',
}

export function statusToColor(status: TelemetryStatus): string {
    return COLOR[status]
}
