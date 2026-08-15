import { cn } from '@/lib/utils'
import type { ChargeStatus } from '@/shared/gd/types'

const STATUS: Record<ChargeStatus, { label: string; className: string }> = {
    draft: { label: 'rascunho', className: 'bg-muted text-muted-foreground' },
    sent: { label: 'enviada', className: 'bg-warning/10 text-warning' },
    paid: { label: 'paga', className: 'bg-success/10 text-success' },
    overdue: { label: 'vencida', className: 'bg-destructive/10 text-destructive' },
    canceled: { label: 'cancelada', className: 'bg-muted text-muted-foreground line-through' },
}

export function ChargeStatusBadge({ status }: { status: ChargeStatus }) {
    const config = STATUS[status] ?? STATUS.draft

    return (
        <span
            data-slot="charge-status-badge"
            className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                config.className,
            )}
        >
            {config.label}
        </span>
    )
}
