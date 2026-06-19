'use client'

import { cn } from '@/lib/utils'

interface LineItemExplanationsProps {
    explanations: Record<string, unknown> | null
    className?: string
}

export function LineItemExplanations({ explanations, className }: LineItemExplanationsProps) {
    if (!explanations || Object.keys(explanations).length === 0) {
        return (
            <div
                data-slot="line-item-explanations"
                className={cn('rounded-2xl border bg-card p-4 text-sm text-muted-foreground', className)}
            >
                Nenhum detalhamento disponivel.
            </div>
        )
    }

    return (
        <div data-slot="line-item-explanations" className={cn('space-y-2', className)}>
            <h3 className="font-display text-sm font-semibold text-foreground">Detalhamento</h3>
            <div className="space-y-2">
                {Object.entries(explanations).map(([key, value]) => (
                    <div
                        key={key}
                        className="rounded-xl border bg-card p-3"
                    >
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {key}
                        </div>
                        <div className="mt-1 text-sm text-foreground">
                            {String(value ?? '—')}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
