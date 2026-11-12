'use client'

import { cn } from '@/lib/utils'

interface LineItemExplanationsProps {
    explanations: Record<string, unknown> | null
    className?: string
}

type Item = { key: string; title: string; description: string | null; extra: string | null }

function text(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value : null
}

// O analisador devolve { secao: { title, description } } e, em "taxes", um nivel a mais
// ({ icms: {...}, pis_cofins: {...} }). Achata tudo em itens com titulo e texto.
function flatten(explanations: Record<string, unknown>): Item[] {
    const items: Item[] = []
    for (const [key, value] of Object.entries(explanations)) {
        if (typeof value === 'string') {
            items.push({ key, title: key.replace(/_/g, ' '), description: value, extra: null })
            continue
        }
        if (!value || typeof value !== 'object') continue
        const obj = value as Record<string, unknown>
        if (text(obj.title) || text(obj.description)) {
            items.push({
                key,
                title: text(obj.title) ?? key.replace(/_/g, ' '),
                description: text(obj.description),
                extra: text(obj.efficiency_assessment),
            })
        } else {
            items.push(...flatten(obj).map((item) => ({ ...item, key: `${key}.${item.key}` })))
        }
    }
    return items
}

export function LineItemExplanations({ explanations, className }: LineItemExplanationsProps) {
    const items = explanations ? flatten(explanations) : []

    if (items.length === 0) {
        return (
            <div
                data-slot="line-item-explanations"
                className={cn('rounded-2xl border bg-card p-4 text-sm text-muted-foreground', className)}
            >
                Nenhum detalhamento disponível.
            </div>
        )
    }

    return (
        <div data-slot="line-item-explanations" className={cn('space-y-2', className)}>
            <h3 className="font-display text-sm font-semibold text-foreground">Entenda sua conta</h3>
            <div className="space-y-2">
                {items.map((item) => (
                    <div key={item.key} className="rounded-xl border bg-card p-3">
                        <div className="text-sm font-medium text-foreground first-letter:uppercase">{item.title}</div>
                        {item.description && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}
                        {item.extra && <p className="mt-1 text-sm text-foreground">{item.extra}</p>}
                    </div>
                ))}
            </div>
        </div>
    )
}
