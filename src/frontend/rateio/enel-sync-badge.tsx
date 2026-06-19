'use client';

import type { EnelSyncStatus } from '@/shared/economia/types';

interface EnelSyncBadgeProps {
    status: EnelSyncStatus;
}

const STATUS_CONFIG: Record<EnelSyncStatus, { label: string; className: string }> = {
    draft: { label: 'Rascunho', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    pending_push: { label: 'Pendente', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    applied: { label: 'Aplicado', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    failed: { label: 'Falhou', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export function EnelSyncBadge({ status }: EnelSyncBadgeProps) {
    const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
            {config.label}
        </span>
    );
}
