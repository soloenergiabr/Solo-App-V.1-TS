'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Loader2, RefreshCw, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import {
    useFaturapiOverview, useFaturapiOverviewActions, type FaturapiOverview,
} from '@/frontend/admin/hooks/use-admin-faturapi';
import {
    errorText, formatCents, formatDate, formatDateTime, FaturapiStatusBadge, triggerLabel,
} from './faturapi-shared';

// Custo atual de uma busca na Faturapi; usado so para estimar quantas buscas o saldo cobre.
const ESTIMATED_COST_CENTS = 39;

type Actions = ReturnType<typeof useFaturapiOverviewActions>;

export function FaturapiOverviewScreen() {
    const { data, isLoading, isError, error, refetch, isFetching } = useFaturapiOverview();
    const actions = useFaturapiOverviewActions();

    if (isLoading) {
        return <div className="flex h-48 items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>;
    }
    if (isError || !data) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Erro ao carregar a Faturapi</AlertTitle>
                <AlertDescription>{error instanceof Error ? error.message : 'Tente novamente.'}</AlertDescription>
            </Alert>
        );
    }

    const orphanUnits = data.units.filter((u) => !u.consumerUnit).length;
    const orphanConnections = data.connections.filter((c) => !c.client).length;
    const failedEvents = data.events.filter((e) => e.status === 'failed').length;
    const attention = data.units.filter((u) => ['needs_credentials', 'overdue'].includes(u.unit.status)).length;

    return (
        <div className="space-y-6">
            {data.errors.length > 0 && (
                <Alert variant="destructive">
                    <AlertTriangle className="size-4" />
                    <AlertTitle>Parte dos dados da Faturapi nao carregou</AlertTitle>
                    <AlertDescription>{data.errors.join(' · ')}</AlertDescription>
                </Alert>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <BalanceCard balanceCents={data.balance?.balanceCents ?? null} />
                <StatCard title="Buscas (30 dias)" value={data.usage ? `${data.usage.completed} ok · ${data.usage.failed} falhas` : '—'}
                    hint={data.usage ? `Custo ${formatCents(data.usage.costCents)}` : undefined} />
                <StatCard title="Unidades monitoradas" value={String(data.units.length)}
                    hint={attention > 0 ? `${attention} precisam de atencao` : 'Todas em dia'} warn={attention > 0} />
                <StatCard title="Pendencias" value={String(orphanUnits + orphanConnections + failedEvents)}
                    hint={`${orphanUnits} unidades e ${orphanConnections} conexoes sem vinculo · ${failedEvents} webhooks com falha`}
                    warn={orphanUnits + orphanConnections + failedEvents > 0} />
            </div>

            <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                    <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} /> Atualizar
                </Button>
            </div>

            <Tabs defaultValue="units">
                <TabsList>
                    <TabsTrigger value="units">Unidades ({data.units.length})</TabsTrigger>
                    <TabsTrigger value="connections">Conexoes ({data.connections.length})</TabsTrigger>
                    <TabsTrigger value="extractions">Extracoes</TabsTrigger>
                    <TabsTrigger value="events">Webhooks{failedEvents > 0 ? ` (${failedEvents} falhas)` : ''}</TabsTrigger>
                </TabsList>
                <TabsContent value="units" className="mt-4"><UnitsTable units={data.units} actions={actions} /></TabsContent>
                <TabsContent value="connections" className="mt-4"><ConnectionsTable connections={data.connections} actions={actions} /></TabsContent>
                <TabsContent value="extractions" className="mt-4"><ExtractionsTable extractions={data.extractions} /></TabsContent>
                <TabsContent value="events" className="mt-4"><EventsTable events={data.events} actions={actions} /></TabsContent>
            </Tabs>
        </div>
    );
}

function StatCard({ title, value, hint, warn }: { title: string; value: string; hint?: string; warn?: boolean }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardDescription>{title}</CardDescription>
                <CardTitle className="text-2xl">{value}</CardTitle>
            </CardHeader>
            {hint && <CardContent className={`text-xs ${warn ? 'text-amber-500' : 'text-muted-foreground'}`}>{hint}</CardContent>}
        </Card>
    );
}

function BalanceCard({ balanceCents }: { balanceCents: number | null }) {
    const searches = balanceCents == null ? null : Math.floor(balanceCents / ESTIMATED_COST_CENTS);
    const low = searches != null && searches < 20;
    return (
        <Card className={low ? 'border-destructive/60' : undefined}>
            <CardHeader className="pb-2">
                <CardDescription>Saldo Faturapi</CardDescription>
                <CardTitle className="text-2xl">{formatCents(balanceCents)}</CardTitle>
            </CardHeader>
            {searches != null && (
                <CardContent className={`text-xs ${low ? 'text-destructive' : 'text-muted-foreground'}`}>
                    ~{searches} buscas{low ? ' · recarregue no painel da Faturapi' : ''}
                </CardContent>
            )}
        </Card>
    );
}

// ---------------------------------------------------------------------------

function UnitsTable({ units, actions }: { units: FaturapiOverview['units']; actions: Actions }) {
    if (units.length === 0) return <Empty text="Nenhuma unidade monitorada na Faturapi." />;
    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>UC</TableHead>
                            <TableHead>Cliente no app</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ultima fatura</TableHead>
                            <TableHead>Proxima busca</TableHead>
                            <TableHead>Leitura prevista</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {units.map(({ unit, consumerUnit, candidates }) => (
                            <TableRow key={unit.id}>
                                <TableCell>
                                    <div className="font-mono text-sm">{unit.uc}</div>
                                    <div className="text-xs text-muted-foreground">{unit.label ?? '—'}</div>
                                </TableCell>
                                <TableCell>
                                    {consumerUnit ? (
                                        <Link className="text-sm underline-offset-4 hover:underline" href={`/clients/${consumerUnit.client.id}`}>
                                            {consumerUnit.client.name} · {consumerUnit.name ?? 'UC'}
                                        </Link>
                                    ) : (
                                        <AssignUnit unitId={unit.id} candidates={candidates} actions={actions} />
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <FaturapiStatusBadge status={unit.status} />
                                        {errorText(unit.lastError) && <div className="max-w-56 text-xs text-destructive">{errorText(unit.lastError)}</div>}
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm">{unit.lastInvoiceMonth ?? '—'}</TableCell>
                                <TableCell className="text-sm">{unit.status === 'paused' ? 'Pausada' : formatDateTime(unit.nextCheckAt)}</TableCell>
                                <TableCell className="text-sm">{formatDate(unit.expectedReadingDate)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function AssignUnit({
    unitId, candidates, actions,
}: { unitId: string; candidates: FaturapiOverview['units'][number]['candidates']; actions: Actions }) {
    const [consumerUnitId, setConsumerUnitId] = useState(candidates[0]?.id ?? '');
    if (candidates.length === 0) {
        return (
            <div className="text-xs text-amber-500">
                Sem UC no app com este numero. Cadastre a UC no cliente (numero do cliente = UC) para vincular.
            </div>
        );
    }
    return (
        <div className="flex items-center gap-2">
            <Select value={consumerUnitId} onValueChange={setConsumerUnitId}>
                <SelectTrigger className="h-8 w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                    {candidates.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.client.name} · {c.name ?? 'UC'}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button size="sm" variant="outline" disabled={!consumerUnitId || actions.assignUnit.isPending}
                onClick={() => actions.assignUnit.mutate({ unitId, consumerUnitId })}>
                Vincular
            </Button>
        </div>
    );
}

function ConnectionsTable({ connections, actions }: { connections: FaturapiOverview['connections']; actions: Actions }) {
    if (connections.length === 0) return <Empty text="Nenhuma conexao na Faturapi. Crie pela aba Faturapi do cliente." />;
    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Login</TableHead>
                            <TableHead>Cliente no app</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>UCs (monitoradas / na conta)</TableHead>
                            <TableHead>Ultima sincronizacao</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {connections.map(({ connection, client }) => (
                            <TableRow key={connection.id}>
                                <TableCell>
                                    <div className="text-sm">{connection.credentialsHint ?? connection.id}</div>
                                    <div className="text-xs text-muted-foreground">{connection.source === 'empresa' ? 'Empresa' : 'Pessoa fisica'}</div>
                                </TableCell>
                                <TableCell>
                                    {client ? (
                                        <Link className="text-sm underline-offset-4 hover:underline" href={`/clients/${client.id}`}>{client.name}</Link>
                                    ) : (
                                        <AssignConnection connectionId={connection.id} actions={actions} />
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <FaturapiStatusBadge status={connection.status} />
                                        {errorText(connection.lastError) && <div className="text-xs text-destructive">{errorText(connection.lastError)}</div>}
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm">
                                    {connection.discoveredUnits.filter((u) => u.monitored).length} / {connection.discoveredUnits.length}
                                </TableCell>
                                <TableCell className="text-sm">{formatDateTime(connection.lastSyncAt)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function AssignConnection({ connectionId, actions }: { connectionId: string; actions: Actions }) {
    const api = useAuthenticatedApi();
    const [clientId, setClientId] = useState('');
    const clients = useQuery({
        queryKey: ['admin', 'clients', 'options'],
        queryFn: async () => {
            const response = await api.get<{ data: Array<{ id: string; name: string; email: string }> }>('/admin/clients');
            return response.data.data;
        },
        enabled: api.isAuthenticated,
        staleTime: 60_000,
    });

    return (
        <div className="flex items-center gap-2">
            <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className="h-8 w-56"><SelectValue placeholder="Escolha o cliente" /></SelectTrigger>
                <SelectContent>
                    {(clients.data ?? []).map((client) => (
                        <SelectItem key={client.id} value={client.id}>{client.name} · {client.email}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button size="sm" variant="outline" disabled={!clientId || actions.assignConnection.isPending}
                onClick={() => actions.assignConnection.mutate({ connectionId, clientId })}>
                Ligar
            </Button>
        </div>
    );
}

function ExtractionsTable({ extractions }: { extractions: FaturapiOverview['extractions'] }) {
    if (extractions.length === 0) return <Empty text="Nenhuma extracao ainda." />;
    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Quando</TableHead>
                            <TableHead>UC</TableHead>
                            <TableHead>Origem</TableHead>
                            <TableHead>Meses</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Custo</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {extractions.map((extraction) => (
                            <TableRow key={extraction.id}>
                                <TableCell className="text-sm">{formatDateTime(extraction.createdAt)}</TableCell>
                                <TableCell className="font-mono text-sm">{extraction.uc}</TableCell>
                                <TableCell className="text-sm">{triggerLabel(extraction.trigger)}</TableCell>
                                <TableCell className="text-sm">{extraction.months.join(', ')}</TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <FaturapiStatusBadge status={extraction.status} />
                                        {extraction.error && <div className="max-w-64 text-xs text-destructive">{errorText(extraction.error)}</div>}
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm">{formatCents(extraction.costCents)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function EventsTable({ events, actions }: { events: FaturapiOverview['events']; actions: Actions }) {
    if (events.length === 0) return <Empty text="Nenhum webhook recebido ainda." />;
    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Recebido</TableHead>
                            <TableHead>Evento</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Acoes</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {events.map((event) => (
                            <TableRow key={event.eventId}>
                                <TableCell className="text-sm">{formatDateTime(event.createdAt)}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-mono">{event.type}</Badge>
                                    <div className="mt-1 font-mono text-xs text-muted-foreground">{event.eventId}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <FaturapiStatusBadge status={event.status} />
                                        {event.error && <div className="max-w-80 text-xs text-destructive">{event.error}</div>}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    {event.status === 'failed' && (
                                        <Button size="sm" variant="outline" disabled={actions.reprocessEvent.isPending}
                                            onClick={() => actions.reprocessEvent.mutate(event.eventId)}>
                                            <RotateCcw className="size-4" /> Reprocessar
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function Empty({ text }: { text: string }) {
    return <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">{text}</p>;
}
