'use client'

import { cn } from '@/lib/utils'
import { Lightbulb } from 'lucide-react'

interface RecommendationsPanelProps {
    recommendations: unknown[] | null
    className?: string
}

export function RecommendationsPanel({ recommendations, className }: RecommendationsPanelProps) {
    if (!recommendations || recommendations.length === 0) {
        return (
            <div
                data-slot="recommendations-panel"
                className={cn('rounded-2xl border bg-card p-4 text-sm text-muted-foreground', className)}
            >
                Nenhuma recomendacao disponivel.
            </div>
        )
    }

    return (
        <div data-slot="recommendations-panel" className={cn('space-y-2', className)}>
            <h3 className="font-display text-sm font-semibold text-foreground">Recomendacoes</h3>
            <div className="space-y-2">
                {recommendations.map((rec, idx) => {
                    const message =
                        typeof rec === 'string'
                            ? rec
                            : (rec as Record<string, unknown>)?.recommendation ??
                              (rec as Record<string, unknown>)?.text ??
                              (rec as Record<string, unknown>)?.message ??
                              JSON.stringify(rec)

                    return (
                        <div
                            key={idx}
                            className="flex items-start gap-3 rounded-xl border bg-card p-3"
                        >
                            <Lightbulb className="mt-0.5 size-4 shrink-0 text-warning" />
                            <span className="text-sm text-foreground">{String(message)}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
