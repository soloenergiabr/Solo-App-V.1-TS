'use client';

import { useMemo, useState } from 'react';
import { Loader2, MoreHorizontal, Plus, RefreshCw, KeyRound, Trash2, Link2, PlugZap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    useClientFaturapi, useClientFaturapiActions, type ClientFaturapiOverview,
} from '@/frontend/admin/hooks/use-admin-faturapi';
import {
    CredentialsFields, credentialsReady, emptyCredentials, errorText, formatDate, formatDateTime,
    FaturapiStatusBadge, triggerLabel, type CredentialsForm,
} from './faturapi-shared';

type Actions = ReturnType<typeof useClientFaturapiActions>;
type ConnectionItem = ClientFaturapiOverview['connections'][number];
type UnitItem = ClientFaturapiOverview['units'][number];

export function ClientFaturapiTab({ clientId }: { clientId: string }) {
    const { data, isLoading, isError, error, refetch, isFetching } = useClientFaturapi(clientId);
    const actions = useClientFaturapiActions(clientId);
    const [creating, setCreating] = useState(false);

    if (isLoading) {
        return <div className="flex h-40 items-center justify-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;
    }
    if (isError || !data) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Erro ao carregar a Faturapi</AlertTitle>
                <AlertDescription>{error instanceof Error ? error.message : 'Tente novamente.'}</AlertDescription>
            </Alert>
        );
    }

    const appUcs = new Map(data.units.filter((u) => u.consumerUnit.clientNumber).map((u) => [u.consumerUnit.clientNumber!, u]));

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                    <div className="space-y-1.5">
                        <CardTitle>Conexoes</CardTitle>
                        <CardDescription>
                            Um login da Enel lista todas as UCs da conta. Escolha quais monitorar: a Faturapi busca a fatura de cada uma todo mes.
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                            <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button size="sm" onClick={() => setCreating(true)}><Plus className="size-4" /> Nova conexao</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {data.connections.length === 0 && (
                        <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                            Nenhuma conexao. Crie uma com o login da Enel do cliente, ou ligue uma conexao existente pela pagina Faturapi.
                        </p>
                    )}
                    {data.connections.map((item) => (
                        <ConnectionCard key={item.id} item={item} actions={actions} plants={data.plants} appUcs={appUcs} />
                    ))}
                </CardContent>
            </Card>

            <UnitsCard units={data.units} actions={actions} />

            <CreateConnectionDialog open={creating} onOpenChange={setCreating} actions={actions} />
        </div>
    );
}

// ---------------------------------------------------------------------------
// Conexoes
// ---------------------------------------------------------------------------

function ConnectionCard({
    item, actions, plants, appUcs,
}: {
    item: ConnectionItem;
    actions: Actions;
    plants: ClientFaturapiOverview['plants'];
    appUcs: Map<string, UnitItem>;
}) {
    const connection = item.connection;
    const [selected, setSelected] = useState<string[]>([]);
    const [plantId, setPlantId] = useState<string>(plants[0]?.id ?? '');
    const [backfill, setBackfill] = useState('0');
    const [editingCredentials, setEditingCredentials] = useState(false);
    const [removing, setRemoving] = useState(false);

    const discovered = connection?.discoveredUnits ?? [];
    // Selecionavel: ainda nao monitorada, ou monitorada mas sem UC vinculada no app.
    const selectable = discovered.filter((u) => !u.monitored || appUcs.get(u.uc)?.consumerUnit.faturapiUnitId !== u.unitId);
    const needsPlant = selected.some((uc) => !appUcs.has(uc));

    const toggle = (uc: string, checked: boolean) =>
        setSelected((prev) => (checked ? [...prev, uc] : prev.filter((x) => x !== uc)));

    const monitor = async () => {
        await actions.monitorUnits.mutateAsync({
            connectionId: item.id,
            ucs: selected,
            plantId: needsPlant ? plantId : undefined,
            backfill: Number(backfill) || 0,
        });
        setSelected([]);
    };

    return (
        <div className="rounded-lg border p-4 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <PlugZap className="size-4 text-muted-foreground" />
                        <span className="font-medium">{connection?.credentialsHint ?? item.record.credentialsHint ?? item.id}</span>
                        <FaturapiStatusBadge status={connection?.status ?? item.record.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {item.record.source === 'empresa' ? 'Empresa' : 'Pessoa fisica'} · ultima sincronizacao {formatDateTime(connection?.lastSyncAt)}
                    </p>
                    {(item.error || connection?.lastError) && (
                        <p className="text-xs text-destructive">{item.error ?? errorText(connection?.lastError)}</p>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={actions.syncConnection.isPending}
                        onClick={() => actions.syncConnection.mutate(item.id)}>
                        <RefreshCw className="size-4" /> Sincronizar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditingCredentials(true)}>
                        <KeyRound className="size-4" /> Senha
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setRemoving(true)}>
                        <Trash2 className="size-4 text-destructive" />
                    </Button>
                </div>
            </div>

            {connection?.status === 'syncing' && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" /> Listando as UCs da conta na Enel...
                </p>
            )}

            {discovered.length > 0 && (
                <>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-8" />
                                <TableHead>UC</TableHead>
                                <TableHead>Titular</TableHead>
                                <TableHead>Endereco</TableHead>
                                <TableHead>No app</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {discovered.map((unit) => {
                                const app = appUcs.get(unit.uc);
                                const linked = unit.monitored && app?.consumerUnit.faturapiUnitId === unit.unitId;
                                const canSelect = selectable.includes(unit);
                                return (
                                    <TableRow key={unit.uc}>
                                        <TableCell>
                                            <Checkbox
                                                disabled={!canSelect}
                                                checked={linked || selected.includes(unit.uc)}
                                                onCheckedChange={(checked) => toggle(unit.uc, checked === true)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{unit.uc}</TableCell>
                                        <TableCell className="text-sm">{unit.name ?? '—'}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{unit.address ?? '—'}</TableCell>
                                        <TableCell className="text-sm">
                                            {linked ? (
                                                <span className="text-success">Monitorada · {app?.consumerUnit.name ?? 'UC'}</span>
                                            ) : unit.monitored ? (
                                                <span className="text-amber-500">Monitorada, sem vinculo{app ? ` (UC ${app.consumerUnit.name ?? unit.uc} existe)` : ''}</span>
                                            ) : app ? (
                                                <span className="text-muted-foreground">UC existe, nao monitorada</span>
                                            ) : (
                                                <span className="text-muted-foreground">Nao monitorada</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    {selected.length > 0 && (
                        <div className="flex flex-wrap items-end gap-3 rounded-md bg-muted/40 p-3">
                            {needsPlant && (
                                <div className="space-y-1.5 min-w-56">
                                    <Label>Usina das UCs novas</Label>
                                    <Select value={plantId} onValueChange={setPlantId}>
                                        <SelectTrigger><SelectValue placeholder="Escolha a usina" /></SelectTrigger>
                                        <SelectContent>
                                            {plants.map((plant) => (
                                                <SelectItem key={plant.id} value={plant.id}>{plant.name || plant.id}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div className="space-y-1.5 w-40">
                                <Label>Meses de historico</Label>
                                <Input type="number" min={0} max={24} value={backfill} onChange={(e) => setBackfill(e.target.value)} />
                            </div>
                            <Button
                                onClick={monitor}
                                disabled={actions.monitorUnits.isPending || (needsPlant && !plantId)}
                            >
                                {actions.monitorUnits.isPending && <Loader2 className="size-4 animate-spin" />}
                                Monitorar {selected.length} UC{selected.length > 1 ? 's' : ''}
                            </Button>
                            <p className="w-full text-xs text-muted-foreground">
                                UCs que ainda nao existem no app sao criadas na usina escolhida. Cada busca (inclusive cada mes de historico) consome credito da Faturapi.
                                {needsPlant && plants.length === 0 && ' Cadastre uma usina para este cliente antes.'}
                            </p>
                        </div>
                    )}
                </>
            )}

            <Dialog open={editingCredentials} onOpenChange={setEditingCredentials}>
                <CredentialsDialogContent
                    title="Atualizar senha da conexao"
                    description="Use quando a Enel recusar a senha. A conexao sincroniza de novo e as UCs voltam a ser buscadas."
                    showSource={false}
                    pending={actions.updateConnectionCredentials.isPending}
                    onSubmit={async (form) => {
                        await actions.updateConnectionCredentials.mutateAsync({
                            connectionId: item.id,
                            credentials: { email: form.email.trim(), password: form.password },
                        });
                        setEditingCredentials(false);
                    }}
                />
            </Dialog>

            <ConfirmDialog
                open={removing}
                onOpenChange={setRemoving}
                title="Remover conexao?"
                description="A Faturapi apaga o login e para de buscar as faturas das UCs desta conexao. As faturas ja salvas continuam no app."
                confirmLabel="Remover"
                onConfirm={() => actions.deleteConnection.mutateAsync(item.id)}
            />
        </div>
    );
}

function CreateConnectionDialog({
    open, onOpenChange, actions,
}: { open: boolean; onOpenChange: (open: boolean) => void; actions: Actions }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <CredentialsDialogContent
                title="Nova conexao"
                description="Entre com o login da Enel do cliente. A Faturapi lista as UCs da conta e voce escolhe quais monitorar."
                pending={actions.createConnection.isPending}
                onSubmit={async (form) => {
                    await actions.createConnection.mutateAsync({
                        source: form.source,
                        credentials: { email: form.email.trim(), password: form.password },
                    });
                    onOpenChange(false);
                }}
            />
        </Dialog>
    );
}

function CredentialsDialogContent({
    title, description, pending, onSubmit, showSource = true,
}: {
    title: string;
    description: string;
    pending: boolean;
    showSource?: boolean;
    onSubmit: (form: CredentialsForm) => Promise<void>;
}) {
    const [form, setForm] = useState<CredentialsForm>(emptyCredentials);
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <CredentialsFields value={form} onChange={setForm} showSource={showSource} />
            <DialogFooter>
                <Button
                    disabled={pending || !credentialsReady(form)}
                    onClick={() => onSubmit(form).then(() => setForm(emptyCredentials)).catch(() => {})}
                >
                    {pending && <Loader2 className="size-4 animate-spin" />} Salvar
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}

// ---------------------------------------------------------------------------
// Unidades consumidoras
// ---------------------------------------------------------------------------

function UnitsCard({ units, actions }: { units: UnitItem[]; actions: Actions }) {
    const [linking, setLinking] = useState<UnitItem | null>(null);
    const [backfilling, setBackfilling] = useState<UnitItem | null>(null);
    const [credentialsFor, setCredentialsFor] = useState<UnitItem | null>(null);
    const [unlinking, setUnlinking] = useState<UnitItem | null>(null);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Unidades consumidoras</CardTitle>
                <CardDescription>Estado da busca automatica de cada UC na Faturapi.</CardDescription>
            </CardHeader>
            <CardContent>
                {units.length === 0 ? (
                    <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                        Nenhuma UC cadastrada para este cliente.
                    </p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>UC</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Ultima fatura</TableHead>
                                <TableHead>Ultima busca</TableHead>
                                <TableHead>Proxima busca</TableHead>
                                <TableHead>Leitura prevista</TableHead>
                                <TableHead className="text-right">Acoes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {units.map((item) => (
                                <UnitRow
                                    key={item.consumerUnit.id}
                                    item={item}
                                    actions={actions}
                                    onLink={() => setLinking(item)}
                                    onBackfill={() => setBackfilling(item)}
                                    onCredentials={() => setCredentialsFor(item)}
                                    onUnlink={() => setUnlinking(item)}
                                />
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            <LinkUnitDialog item={linking} onClose={() => setLinking(null)} actions={actions} />
            <BackfillDialog item={backfilling} onClose={() => setBackfilling(null)} actions={actions} />

            <Dialog open={!!credentialsFor} onOpenChange={(open) => !open && setCredentialsFor(null)}>
                <CredentialsDialogContent
                    title="Atualizar senha da UC"
                    description="Use quando a Enel recusar a senha. A busca automatica volta a funcionar."
                    showSource={false}
                    pending={actions.updateUnit.isPending}
                    onSubmit={async (form) => {
                        await actions.updateUnit.mutateAsync({
                            unitId: credentialsFor!.consumerUnit.id,
                            credentials: { email: form.email.trim(), password: form.password },
                        });
                        setCredentialsFor(null);
                    }}
                />
            </Dialog>

            <ConfirmDialog
                open={!!unlinking}
                onOpenChange={(open) => !open && setUnlinking(null)}
                title="Desvincular da Faturapi?"
                description="A Faturapi para de buscar as faturas desta UC e apaga as credenciais dela. As faturas ja salvas continuam no app."
                confirmLabel="Desvincular"
                onConfirm={() => actions.unlinkUnit.mutateAsync(unlinking!.consumerUnit.id)}
            />
        </Card>
    );
}

function UnitRow({
    item, actions, onLink, onBackfill, onCredentials, onUnlink,
}: {
    item: UnitItem;
    actions: Actions;
    onLink: () => void;
    onBackfill: () => void;
    onCredentials: () => void;
    onUnlink: () => void;
}) {
    const { consumerUnit, unit } = item;
    const lastExtraction = item.extractions[0];
    const linked = !!consumerUnit.faturapiUnitId;
    const busy = lastExtraction && (lastExtraction.status === 'pending' || lastExtraction.status === 'processing');
    const error = item.error ?? errorText(unit?.lastError) ?? (lastExtraction?.status === 'failed' ? errorText(lastExtraction.error) : null);

    return (
        <TableRow>
            <TableCell>
                <div className="font-medium">{consumerUnit.name || 'UC'}</div>
                <div className="font-mono text-xs text-muted-foreground">{consumerUnit.clientNumber ?? 'sem numero'}</div>
                {consumerUnit.faturapiConnectionId && <div className="text-xs text-muted-foreground">via conexao</div>}
            </TableCell>
            <TableCell>
                <div className="space-y-1">
                    <FaturapiStatusBadge status={unit?.status ?? consumerUnit.faturapiStatus} />
                    {unit?.overdueSince && <div className="text-xs text-destructive">desde {formatDate(unit.overdueSince)}</div>}
                    {error && <div className="max-w-56 text-xs text-destructive">{error}</div>}
                </div>
            </TableCell>
            <TableCell className="text-sm">{unit?.lastInvoiceMonth ?? '—'}</TableCell>
            <TableCell className="text-sm">
                {lastExtraction ? (
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                            {busy && <Loader2 className="size-3 animate-spin" />}
                            <FaturapiStatusBadge status={lastExtraction.status} />
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {formatDateTime(lastExtraction.createdAt)} · {triggerLabel(lastExtraction.trigger)}
                        </div>
                    </div>
                ) : formatDateTime(unit?.lastCheckAt)}
            </TableCell>
            <TableCell className="text-sm">{unit?.status === 'paused' ? 'Pausada' : formatDateTime(unit?.nextCheckAt)}</TableCell>
            <TableCell className="text-sm">{formatDate(unit?.expectedReadingDate)}</TableCell>
            <TableCell className="text-right">
                {!linked ? (
                    <Button size="sm" variant="outline" disabled={!consumerUnit.clientNumber} onClick={onLink}
                        title={consumerUnit.clientNumber ? undefined : 'Cadastre o numero do cliente (UC) primeiro'}>
                        <Link2 className="size-4" /> Vincular
                    </Button>
                ) : (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost"><MoreHorizontal className="size-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem disabled={!!busy} onClick={() => actions.checkUnit.mutate(consumerUnit.id)}>
                                Buscar fatura agora
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onBackfill}>Buscar historico</DropdownMenuItem>
                            {unit?.status === 'paused' ? (
                                <DropdownMenuItem onClick={() => actions.updateUnit.mutate({ unitId: consumerUnit.id, status: 'active' })}>
                                    Retomar busca automatica
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onClick={() => actions.updateUnit.mutate({ unitId: consumerUnit.id, status: 'paused' })}>
                                    Pausar busca automatica
                                </DropdownMenuItem>
                            )}
                            {!consumerUnit.faturapiConnectionId && (
                                <DropdownMenuItem onClick={onCredentials}>Atualizar senha</DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={onUnlink}>Desvincular</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </TableCell>
        </TableRow>
    );
}

function LinkUnitDialog({ item, onClose, actions }: { item: UnitItem | null; onClose: () => void; actions: Actions }) {
    const [source, setSource] = useState<'pessoa' | 'empresa' | 'inbox'>('pessoa');
    const [form, setForm] = useState<CredentialsForm>(emptyCredentials);
    const [backfill, setBackfill] = useState('0');
    const ready = source === 'inbox' || credentialsReady(form);

    const submit = async () => {
        await actions.linkUnit.mutateAsync({
            unitId: item!.consumerUnit.id,
            source,
            credentials: source === 'inbox' ? undefined : { email: form.email.trim(), password: form.password },
            backfill: Number(backfill) || 0,
        });
        setForm(emptyCredentials);
        onClose();
    };

    return (
        <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Vincular UC {item?.consumerUnit.clientNumber}</DialogTitle>
                    <DialogDescription>
                        Para varias UCs do mesmo login, prefira criar uma conexao. Aqui o login vale so para esta UC.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <Label>Origem</Label>
                        <Select value={source} onValueChange={(value) => setSource(value as typeof source)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pessoa">Login Enel - pessoa fisica</SelectItem>
                                <SelectItem value="empresa">Login Enel - empresa</SelectItem>
                                <SelectItem value="inbox">E-mail (fatura encaminhada para a caixa da Faturapi)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {source !== 'inbox' && (
                        <CredentialsFields value={{ ...form, source }} onChange={setForm} showSource={false} />
                    )}
                    <div className="space-y-1.5">
                        <Label>Meses de historico</Label>
                        <Input type="number" min={0} max={24} value={backfill} onChange={(e) => setBackfill(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button disabled={!ready || actions.linkUnit.isPending} onClick={() => submit().catch(() => {})}>
                        {actions.linkUnit.isPending && <Loader2 className="size-4 animate-spin" />} Vincular
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function BackfillDialog({ item, onClose, actions }: { item: UnitItem | null; onClose: () => void; actions: Actions }) {
    const [months, setMonths] = useState('6');
    const value = useMemo(() => Math.min(24, Math.max(1, Number(months) || 1)), [months]);

    return (
        <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Buscar historico</DialogTitle>
                    <DialogDescription>
                        Busca as faturas dos ultimos meses da UC {item?.consumerUnit.clientNumber}. Cada fatura consome credito da Faturapi.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-1.5">
                    <Label>Meses (1 a 24)</Label>
                    <Input type="number" min={1} max={24} value={months} onChange={(e) => setMonths(e.target.value)} />
                </div>
                <DialogFooter>
                    <Button
                        disabled={actions.backfillUnit.isPending}
                        onClick={() => actions.backfillUnit
                            .mutateAsync({ unitId: item!.consumerUnit.id, months: value })
                            .then(onClose)
                            .catch(() => {})}
                    >
                        {actions.backfillUnit.isPending && <Loader2 className="size-4 animate-spin" />} Buscar {value} meses
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function ConfirmDialog({
    open, onOpenChange, title, description, confirmLabel, onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => Promise<unknown>;
}) {
    const [pending, setPending] = useState(false);
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={pending}
                        className="bg-destructive text-white hover:bg-destructive/90"
                        onClick={(event) => {
                            event.preventDefault();
                            setPending(true);
                            onConfirm()
                                .then(() => onOpenChange(false))
                                .catch(() => {})
                                .finally(() => setPending(false));
                        }}
                    >
                        {pending && <Loader2 className="size-4 animate-spin" />} {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
