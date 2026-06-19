'use client'

import { cn } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'

interface AlertsPanelProps {
    alerts: unknown[] | null
    className?: string
}

export function AlertsPanel({ alerts, className }: AlertsPanelProps) {
    if (!alerts || alerts.length === 0) {
        return (
            <div
                data-slot="alerts-panel"
                className={cn('rounded-2xl border bg-card p-4 text-sm text-muted-foreground', className)}
            >
                Nenhum alerta identificado.
            </div>
        )
    }

    return (
        <div data-slot="alerts-panel" className={cn('space-y-2', className)}>
            <h3 className="font-display text-sm font-semibold text-foreground">Alertas</h3>
            <div className="space-y-2">
                {alerts.map((alert, idx) => {
                    const message =
                        typeof alert === 'string'
                            ? alert
                            : (alert as Record<string, unknown>)?.message ??
                              (alert as Record<string, unknown>)?.text ??
                              JSON.stringify(alert)

                    return (
                        <div
                            key={idx}
                            className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-3"
                        >
                            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                            <span className="text-sm text-foreground">{String(message)}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
