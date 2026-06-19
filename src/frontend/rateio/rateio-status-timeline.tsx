'use client';

import type { EnelSyncStatus } from '@/shared/economia/types';

interface RateioStatusTimelineProps {
    status: EnelSyncStatus;
    createdAt: string;
    requestedAt: string | null;
    appliedAt: string | null;
    syncError: string | null;
}

interface TimelineStep {
    label: string;
    date: string | null;
    active: boolean;
    completed: boolean;
    description?: string;
}

export function RateioStatusTimeline({ status, createdAt, requestedAt, appliedAt, syncError }: RateioStatusTimelineProps) {
    const order: EnelSyncStatus[] = ['draft', 'pending_push', 'applied'];
    const currentIndex = order.indexOf(status);
    const isFailed = status === 'failed';

    const steps: TimelineStep[] = [
        {
            label: 'Rascunho',
            date: createdAt,
            active: currentIndex >= 0,
            completed: currentIndex > 0,
        },
        {
            label: 'Pendente',
            date: requestedAt,
            active: currentIndex >= 1,
            completed: currentIndex > 1,
        },
        {
            label: isFailed ? 'Falhou' : 'Aplicado',
            date: isFailed ? null : appliedAt,
            active: isFailed || currentIndex >= 2,
            completed: !isFailed && currentIndex >= 2,
            description: isFailed && syncError ? syncError : undefined,
        },
    ];

    return (
        <div className="space-y-3">
            {steps.map((step, i) => (
                <div key={step.label} className="flex gap-3">
                    <div className="flex flex-col items-center">
                        <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                step.completed
                                    ? 'bg-green-500 text-white'
                                    : step.active
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground'
                            }`}
                        >
                            {step.completed ? '\u2713' : i + 1}
                        </div>
                        {i < steps.length - 1 && (
                            <div
                                className={`mt-1 w-px flex-1 ${
                                    step.completed ? 'bg-green-500' : 'bg-muted'
                                }`}
                            />
                        )}
                    </div>
                    <div className="pb-4">
                        <p
                            className={`text-sm font-medium ${
                                step.active ? 'text-foreground' : 'text-muted-foreground'
                            }`}
                        >
                            {step.label}
                        </p>
                        {step.date && (
                            <p className="text-xs text-muted-foreground">
                                {new Date(step.date).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        )}
                        {step.description && (
                            <p className="mt-1 text-xs text-destructive">{step.description}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
