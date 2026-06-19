'use client';

import { Badge } from '@/components/ui/badge';
import type { EnelSyncStatus } from '@/shared/economia/types';

interface EnelSyncBadgeProps {
    status: EnelSyncStatus;
}

const STATUS_CONFIG: Record<EnelSyncStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
    draft: { label: 'Rascunho', variant: 'secondary' },
    pending_push: { label: 'Pendente', variant: 'outline', className: 'border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:bg-amber-900/20' },
    applied: { label: 'Aplicado', variant: 'default', className: 'bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-600' },
    failed: { label: 'Falhou', variant: 'destructive' },
};

export function EnelSyncBadge({ status }: EnelSyncBadgeProps) {
    const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
    return (
        <Badge variant={config.variant} className={config.className}>
            {config.label}
        </Badge>
    );
}
