'use client';

interface RateioAuditListProps {
    createdAt: string;
    requestedAt: string | null;
    appliedAt: string | null;
    enelSyncStatus: string;
    syncError: string | null;
}

interface AuditEvent {
    label: string;
    date: string | null;
    type: 'created' | 'pending' | 'applied' | 'failed';
}

export function RateioAuditList({ createdAt, requestedAt, appliedAt, enelSyncStatus, syncError }: RateioAuditListProps) {
    const events: AuditEvent[] = [
        { label: 'Rateio criado', date: createdAt, type: 'created' },
    ];

    if (requestedAt) {
        events.push({ label: 'Alteração solicitada (Enel)', date: requestedAt, type: 'pending' });
    }

    if (appliedAt && enelSyncStatus === 'applied') {
        events.push({ label: 'Aplicado na distribuidora', date: appliedAt, type: 'applied' });
    }

    if (enelSyncStatus === 'failed' && syncError) {
        events.push({ label: `Falha: ${syncError}`, date: null, type: 'failed' });
    }

    if (events.length === 0) {
        return <p className="text-sm text-muted-foreground">Nenhum evento registrado.</p>;
    }

    return (
        <div className="space-y-2">
            {events.map((event) => (
                <div
                    key={`${event.label}-${event.date ?? 'no-date'}`}
                    className="flex items-start justify-between rounded-md border bg-card p-3 text-sm"
                >
                    <div className="flex items-center gap-2">
                        <span
                            className={`h-2 w-2 shrink-0 rounded-full ${
                                event.type === 'applied'
                                    ? 'bg-green-500'
                                    : event.type === 'failed'
                                        ? 'bg-red-500'
                                        : event.type === 'pending'
                                            ? 'bg-amber-500'
                                            : 'bg-muted-foreground'
                            }`}
                        />
                        <span className="text-foreground">{event.label}</span>
                    </div>
                    {event.date && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                            {new Date(event.date).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}
