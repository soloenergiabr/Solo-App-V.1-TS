'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Loader2, Search, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { withAuth } from '@/frontend/auth/contexts/auth-context';
import { apiErrorMessage, useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import { PageHeader, PageLayout } from '@/components/ui/page-layout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatBRL, MetricTile } from '@/frontend/telemetry-kit';

type Status = 'pending' | 'approved' | 'rejected';
type Person = { id: string; name: string; email: string; phone?: string | null };
type Indication = {
    id: string;
    status: Status;
    projectValue: number | null;
    createdAt: string;
    referrer: Person;
    referred: Person;
    rewardCoins: number;
};
type RankingRow = {
    clientId: string;
    name: string;
    indications: number;
    approved: number;
    coinsEarned: number;
    coinsRedeemed: number;
    redemptions: number;
};

const STATUS: Record<Status, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: { label: 'Pendente', variant: 'outline' },
    approved: { label: 'Convertida', variant: 'default' },
    rejected: { label: 'Recusada', variant: 'destructive' },
};

const coins = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

function IndicationsPage() {
    const api = useAuthenticatedApi();
    const queryClient = useQueryClient();
    const query = useQuery({
        queryKey: ['admin-indications'],
        enabled: api.isAuthenticated,
        queryFn: async () =>
            (await api.get<{ data: { indications: Indication[]; ranking: RankingRow[] } }>('/admin/indications')).data.data,
    });

    const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');
    const [search, setSearch] = useState('');
    const [approving, setApproving] = useState<Indication | null>(null);
    const [projectValue, setProjectValue] = useState('');

    const updateStatus = useMutation({
        mutationFn: async (body: { id: string; status: Status; projectValue?: number }) =>
            api.patch(`/admin/indications/${body.id}`, { status: body.status, projectValue: body.projectValue }),
        onSuccess: (_data, body) => {
            toast.success(body.status === 'approved' ? 'Indicação aprovada e comissão creditada' : 'Indicação recusada');
            setApproving(null);
            void queryClient.invalidateQueries({ queryKey: ['admin-indications'] });
        },
        onError: (error) => toast.error(apiErrorMessage(error, 'Não foi possível atualizar a indicação')),
    });

    const all = useMemo(() => query.data?.indications ?? [], [query.data]);
    const summary = useMemo(() => {
        const approved = all.filter((i) => i.status === 'approved').length;
        return {
            total: all.length,
            approved,
            pending: all.filter((i) => i.status === 'pending').length,
            rate: all.length ? Math.round((approved / all.length) * 100) : 0,
            coinsPaid: all.reduce((sum, i) => sum + i.rewardCoins, 0),
        };
    }, [all]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return all.filter((i) => {
            if (statusFilter !== 'all' && i.status !== statusFilter) return false;
            if (!term) return true;
            return [i.referrer.name, i.referrer.email, i.referred.name, i.referred.email, i.referred.phone ?? '']
                .some((field) => field.toLowerCase().includes(term));
        });
    }, [all, statusFilter, search]);

    const openApprove = (indication: Indication) => {
        setProjectValue(indication.projectValue ? String(indication.projectValue) : '');
        setApproving(indication);
    };

    return (
        <PageLayout header={<PageHeader title="Indicações" subtitle="Controle das indicações do Clube Solo e engajamento dos clientes" />}>
            {query.isError ? (
                <Alert variant="destructive">
                    <AlertTitle>Não foi possível carregar as indicações</AlertTitle>
                    <AlertDescription>{apiErrorMessage(query.error, 'Tente novamente em instantes.')}</AlertDescription>
                </Alert>
            ) : !query.data ? (
                <div className="grid gap-4 md:grid-cols-4">
                    {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <MetricTile label="Indicações" value={summary.total} sublabel={`${summary.pending} pendentes`} />
                        <MetricTile label="Convertidas" value={summary.approved} />
                        <MetricTile label="Taxa de conversão" value={`${summary.rate}%`} />
                        <MetricTile label="Solo Coins pagos" value={coins(summary.coinsPaid)} sublabel="em comissões de indicação" />
                    </div>

                    <Tabs defaultValue="indications">
                        <TabsList>
                            <TabsTrigger value="indications">Indicações</TabsTrigger>
                            <TabsTrigger value="ranking">Ranking de engajamento</TabsTrigger>
                        </TabsList>

                        <TabsContent value="indications" className="space-y-4">
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        className="pl-9"
                                        placeholder="Buscar por quem indicou ou pelo indicado (nome, e-mail, telefone)"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        aria-label="Buscar indicações"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | Status)}>
                                    <SelectTrigger className="sm:w-48" aria-label="Filtrar por status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos os status</SelectItem>
                                        <SelectItem value="pending">Pendentes</SelectItem>
                                        <SelectItem value="approved">Convertidas</SelectItem>
                                        <SelectItem value="rejected">Recusadas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Quem indicou</TableHead>
                                            <TableHead>Indicado</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Data</TableHead>
                                            <TableHead className="text-right">Projeto</TableHead>
                                            <TableHead className="text-right">Solo Coins</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filtered.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                                    {all.length === 0 ? 'Nenhuma indicação ainda.' : 'Nenhuma indicação encontrada com esses filtros.'}
                                                </TableCell>
                                            </TableRow>
                                        ) : filtered.map((i) => (
                                            <TableRow key={i.id}>
                                                <TableCell>
                                                    <Link href={`/clients/${i.referrer.id}`} className="font-medium hover:underline">{i.referrer.name}</Link>
                                                    <span className="block text-xs text-muted-foreground">{i.referrer.email}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Link href={`/clients/${i.referred.id}`} className="font-medium hover:underline">{i.referred.name}</Link>
                                                    <span className="block text-xs text-muted-foreground">
                                                        {[i.referred.email, i.referred.phone].filter(Boolean).join(' · ')}
                                                    </span>
                                                </TableCell>
                                                <TableCell><Badge variant={STATUS[i.status].variant}>{STATUS[i.status].label}</Badge></TableCell>
                                                <TableCell className="whitespace-nowrap">{new Date(i.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                                                <TableCell className="whitespace-nowrap text-right">{i.projectValue ? formatBRL(i.projectValue) : '—'}</TableCell>
                                                <TableCell className="text-right">{i.rewardCoins ? coins(i.rewardCoins) : '—'}</TableCell>
                                                <TableCell className="text-right">
                                                    {i.status !== 'approved' && (
                                                        <div className="flex justify-end gap-1">
                                                            <Button size="sm" variant="ghost" onClick={() => openApprove(i)}>
                                                                <CheckCircle2 className="mr-1 h-4 w-4 text-emerald-500" /> Aprovar
                                                            </Button>
                                                            {i.status === 'pending' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    disabled={updateStatus.isPending}
                                                                    onClick={() => updateStatus.mutate({ id: i.id, status: 'rejected' })}
                                                                >
                                                                    <XCircle className="mr-1 h-4 w-4 text-destructive" /> Recusar
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>

                        <TabsContent value="ranking">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Clientes mais engajados no clube</CardTitle>
                                    <CardDescription>Ordenado por indicações convertidas e, em seguida, por Solo Coins ganhos.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-12">#</TableHead>
                                                    <TableHead>Cliente</TableHead>
                                                    <TableHead className="text-right">Indicações</TableHead>
                                                    <TableHead className="text-right">Convertidas</TableHead>
                                                    <TableHead className="text-right">Coins ganhos</TableHead>
                                                    <TableHead className="text-right">Coins resgatados</TableHead>
                                                    <TableHead className="text-right">Resgates</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {query.data.ranking.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                                            Nenhum cliente participou do clube ainda.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : query.data.ranking.map((row, index) => (
                                                    <TableRow key={row.clientId}>
                                                        <TableCell className="text-muted-foreground">{index + 1}º</TableCell>
                                                        <TableCell>
                                                            <Link href={`/clients/${row.clientId}`} className="font-medium hover:underline">{row.name}</Link>
                                                        </TableCell>
                                                        <TableCell className="text-right">{row.indications}</TableCell>
                                                        <TableCell className="text-right">{row.approved}</TableCell>
                                                        <TableCell className="text-right">{coins(row.coinsEarned)}</TableCell>
                                                        <TableCell className="text-right">{coins(row.coinsRedeemed)}</TableCell>
                                                        <TableCell className="text-right">{row.redemptions}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            )}

            <Dialog open={!!approving} onOpenChange={(open) => !open && setApproving(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Aprovar indicação</DialogTitle>
                        <DialogDescription>
                            {approving?.referred.name} fechou projeto? {approving?.referrer.name} recebe a comissão em Solo Coins
                            conforme o percentual definido em Regras do clube. A comissão é paga uma única vez.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        className="space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            if (approving) updateStatus.mutate({ id: approving.id, status: 'approved', projectValue: Number(projectValue) });
                        }}
                    >
                        <div className="space-y-2">
                            <Label htmlFor="project-value">Valor do projeto fechado (R$)</Label>
                            <Input
                                id="project-value"
                                type="number"
                                min="0.01"
                                step="0.01"
                                required
                                value={projectValue}
                                onChange={(event) => setProjectValue(event.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setApproving(null)}>Cancelar</Button>
                            <Button type="submit" disabled={!(Number(projectValue) > 0) || updateStatus.isPending}>
                                {updateStatus.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Aprovar e creditar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </PageLayout>
    );
}

export default withAuth(IndicationsPage, ['master']);
