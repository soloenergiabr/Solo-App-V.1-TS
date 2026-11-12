'use client'

import { cn } from '@/lib/utils'
import { Lightbulb } from 'lucide-react'

interface RecommendationsPanelProps {
    recommendations: unknown[] | null
    className?: string
}

// Formato do analisador: { priority: alta|media|baixa, title, description, estimated_savings }.
const PRIORITY: Record<string, { label: string; cls: string }> = {
    alta: { label: 'Prioridade alta', cls: 'bg-destructive/10 text-destructive' },
    media: { label: 'Prioridade média', cls: 'bg-amber-500/10 text-amber-500' },
    baixa: { label: 'Prioridade baixa', cls: 'bg-muted text-muted-foreground' },
}

function text(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value : null
}

export function RecommendationsPanel({ recommendations, className }: RecommendationsPanelProps) {
    if (!recommendations || recommendations.length === 0) {
        return (
            <div
                data-slot="recommendations-panel"
                className={cn('rounded-2xl border bg-card p-4 text-sm text-muted-foreground', className)}
            >
                Nenhuma recomendação disponível.
            </div>
        )
    }

    return (
        <div data-slot="recommendations-panel" className={cn('space-y-2', className)}>
            <h3 className="font-display text-sm font-semibold text-foreground">Recomendações</h3>
            <div className="space-y-2">
                {recommendations.map((rec, idx) => {
                    const obj = (typeof rec === 'object' && rec ? rec : {}) as Record<string, unknown>
                    const title = typeof rec === 'string'
                        ? rec
                        : text(obj.title) ?? text(obj.recommendation) ?? text(obj.text) ?? text(obj.message)
                    const description = text(obj.description)
                    const savings = text(obj.estimated_savings)
                    const priority = PRIORITY[String(obj.priority ?? '')]
                    if (!title && !description) return null

                    return (
                        <div key={idx} className="flex items-start gap-3 rounded-xl border bg-card p-3">
                            <Lightbulb className="mt-0.5 size-4 shrink-0 text-warning" />
                            <div className="space-y-1 text-sm">
                                <div className="flex flex-wrap items-center gap-2">
                                    {title && <p className="font-medium text-foreground">{title}</p>}
                                    {priority && (
                                        <span className={cn('rounded-full px-2 py-0.5 text-xs', priority.cls)}>{priority.label}</span>
                                    )}
                                </div>
                                {description && <p className="text-muted-foreground">{description}</p>}
                                {savings && <p className="text-emerald-500">{savings}</p>}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
