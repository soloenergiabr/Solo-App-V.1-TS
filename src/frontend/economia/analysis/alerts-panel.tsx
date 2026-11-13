'use client'

import { cn } from '@/lib/utils'
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'

interface AlertsPanelProps {
    alerts: unknown[] | null
    className?: string
}

// Formato do analisador: { type: success|info|warning|error, title, description, action }.
const TONES = {
    success: { icon: CheckCircle2, box: 'border-emerald-500/20 bg-emerald-500/5', iconCls: 'text-emerald-500' },
    info: { icon: Info, box: 'border-sky-500/20 bg-sky-500/5', iconCls: 'text-sky-500' },
    warning: { icon: AlertTriangle, box: 'border-amber-500/20 bg-amber-500/5', iconCls: 'text-amber-500' },
    error: { icon: XCircle, box: 'border-destructive/20 bg-destructive/5', iconCls: 'text-destructive' },
} as const

function text(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value : null
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
                    const obj = (typeof alert === 'object' && alert ? alert : {}) as Record<string, unknown>
                    const title = typeof alert === 'string' ? alert : text(obj.title) ?? text(obj.message) ?? text(obj.text)
                    const description = text(obj.description)
                    const action = text(obj.action)
                    const tone = TONES[(obj.type as keyof typeof TONES)] ?? TONES.warning
                    const Icon = tone.icon
                    if (!title && !description) return null

                    return (
                        <div key={idx} className={cn('flex items-start gap-3 rounded-xl border p-3', tone.box)}>
                            <Icon className={cn('mt-0.5 size-4 shrink-0', tone.iconCls)} />
                            <div className="space-y-1 text-sm">
                                {title && <p className="font-medium text-foreground">{title}</p>}
                                {description && <p className="text-muted-foreground">{description}</p>}
                                {action && <p className="text-foreground"><span className="font-medium">O que fazer:</span> {action}</p>}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
