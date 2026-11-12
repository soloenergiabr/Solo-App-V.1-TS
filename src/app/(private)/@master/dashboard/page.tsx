'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowRight, CheckCircle2, Users } from 'lucide-react';
import { withAuth } from '@/frontend/auth/contexts/auth-context';
import { apiErrorMessage, useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import { PageHeader, PageLayout } from '@/components/ui/page-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatBRL, formatKwh, MetricTile } from '@/frontend/telemetry-kit';
import { ExportMenu, downloadCsv } from '@/frontend/lib/export';

type Dashboard = {
    clients: { active: number; leads: number; inactive: number };
    plants: number;
    consumerUnits: number;
    monitoredUnits: number;
    bills: {
        paid: number; overdue: number; open: number; last12Months: number;
        avgConsumptionKwh: number; savingsLast12Months: number; billedLast12Months: number;
    };
    pending: { plants: number; consumerUnits: number; bills: number; generation: number };
    club: {
        activeOffers: number; redemptions: number; indications: number; indicationsApproved: number;
        coinsIssued: number; ranking: { clientId: string; name: string; coins: number }[];
    };
    recentBills: {
        id: string; clientId: string; clientName: string; unitName: string | null; reference: string;
        total: number | null; dueDate: string | null; paid: boolean; source: string;
    }[];
};

function AdminDashboardPage() {
    const api = useAuthenticatedApi();
    const query = useQuery({
        queryKey: ['admin-dashboard'],
        enabled: api.isAuthenticated,
        queryFn: async () => (await api.get<{ data: Dashboard }>('/admin/dashboard')).data.data,
    });
    const d = query.data;

    const pendingItems = d ? [
        { count: d.pending.plants + d.pending.consumerUnits, label: 'usinas/UCs aguardando aprovação', href: '/admin/approvals' },
        { count: d.pending.bills, label: 'faturas enviadas por clientes para validar', href: '/admin/bills/validation' },
        { count: d.pending.generation, label: 'gerações manuais para validar', href: '/admin/bills/validation' },
        { count: d.bills.overdue, label: 'faturas vencidas sem pagamento', href: '/clients' },
    ].filter((item) => item.count > 0) : [];

    return (
        <PageLayout
            header={
                <PageHeader
                    title="Dashboard"
                    subtitle="Visão geral da base de clientes, faturas e Clube Solo"
                    actions={<>
                        <ExportMenu disabled={!d} onCsv={() => d && downloadCsv('indicadores-admin', ['Indicador', 'Valor'], kpiRows(d))} />
                        <Button asChild size="sm"><Link href="/clients"><Users className="mr-2 h-4 w-4" />Clientes</Link></Button>
                    </>}
                />
            }
        >
            {query.isError ? (
                <Alert variant="destructive">
                    <AlertTitle>Não foi possível carregar o dashboard</AlertTitle>
                    <AlertDescription>{apiErrorMessage(query.error, 'Tente novamente em instantes.')}</AlertDescription>
                </Alert>
            ) : !d ? (
                <div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
            ) : (
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">O que precisa da sua atenção</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {pendingItems.length === 0 ? (
                                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Nada pendente. Tudo em dia.
                                </p>
                            ) : pendingItems.map((item) => (
                                <Link key={item.label} href={item.href} className="flex items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm hover:bg-amber-500/10">
                                    <span className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                                        <strong>{item.count}</strong> {item.label}
                                    </span>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </Link>
                            ))}
                        </CardContent>
                    </Card>

                    <section className="space-y-3">
                        <h2 className="text-sm font-medium text-muted-foreground">Base de clientes</h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <MetricTile label="Clientes ativos" value={d.clients.active} sublabel={`${d.clients.leads} leads · ${d.clients.inactive} inativos`} />
                            <MetricTile label="Usinas" value={d.plants} sublabel={`${d.consumerUnits} unidades consumidoras`} />
                            <MetricTile label="Busca automática de faturas" value={`${d.monitoredUnits}/${d.consumerUnits}`} sublabel="UCs com fatura chegando sozinha" />
                            <MetricTile label="Consumo médio da base" value={formatKwh(d.bills.avgConsumptionKwh)} sublabel="por fatura, últimos 12 meses" />
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-sm font-medium text-muted-foreground">Faturas</h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <MetricTile label="Faturas (12 meses)" value={d.bills.last12Months} sublabel={`${formatBRL(d.bills.billedLast12Months)} faturados`} />
                            <MetricTile label="Pagas" value={d.bills.paid} />
                            <MetricTile label="A pagar" value={d.bills.open} />
                            <MetricTile label="Vencidas" value={d.bills.overdue} className={d.bills.overdue > 0 ? 'border-destructive/40' : undefined} />
                        </div>
                        <MetricTile label="Economia gerada aos clientes (12 meses)" value={formatBRL(d.bills.savingsLast12Months)} sublabel="créditos de energia solar abatidos nas contas" />
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-sm font-medium text-muted-foreground">Clube Solo</h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <MetricTile label="Ofertas ativas" value={d.club.activeOffers} />
                            <MetricTile label="Resgates" value={d.club.redemptions} />
                            <MetricTile label="Indicações" value={d.club.indications} sublabel={`${d.club.indicationsApproved} convertidas`} />
                            <MetricTile label="Solo Coins emitidos" value={d.club.coinsIssued.toLocaleString('pt-BR')} />
                        </div>
                    </section>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Faturas recentes</CardTitle>
                                <CardDescription>Últimas faturas que entraram no sistema.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                {d.recentBills.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Nenhuma fatura ainda.</p>
                                ) : d.recentBills.map((bill) => (
                                    <Link key={bill.id} href={`/clients/${bill.clientId}`} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm hover:bg-muted/60">
                                        <span className="min-w-0">
                                            <span className="block truncate font-medium">{bill.clientName}</span>
                                            <span className="block truncate text-xs text-muted-foreground">{bill.unitName ?? 'UC'} · {bill.reference} · {bill.source}</span>
                                        </span>
                                        <span className="shrink-0 text-right">
                                            <span className="block">{bill.total != null ? formatBRL(bill.total, { cents: true }) : '—'}</span>
                                            <span className={bill.paid ? 'text-xs text-emerald-500' : 'text-xs text-muted-foreground'}>
                                                {bill.paid ? 'paga' : bill.dueDate ? `vence ${new Date(bill.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}` : 'a pagar'}
                                            </span>
                                        </span>
                                    </Link>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Ranking do clube</CardTitle>
                                <CardDescription>Clientes que mais acumularam Solo Coins.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                {d.club.ranking.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Ninguém acumulou Solo Coins ainda.</p>
                                ) : d.club.ranking.map((row, index) => (
                                    <Link key={row.clientId} href={`/clients/${row.clientId}`} className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-muted/60">
                                        <span><span className="mr-2 text-muted-foreground">{index + 1}º</span>{row.name}</span>
                                        <span className="font-medium">{row.coins.toLocaleString('pt-BR')} coins</span>
                                    </Link>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </PageLayout>
    );
}

// Mesmos números dos cards, em valores brutos para a planilha.
function kpiRows(d: Dashboard): (string | number)[][] {
    return [
        ['Clientes ativos', d.clients.active],
        ['Leads', d.clients.leads],
        ['Clientes inativos', d.clients.inactive],
        ['Usinas', d.plants],
        ['Unidades consumidoras', d.consumerUnits],
        ['UCs com busca automática de faturas', d.monitoredUnits],
        ['Consumo médio por fatura, 12 meses (kWh)', d.bills.avgConsumptionKwh],
        ['Faturas, 12 meses', d.bills.last12Months],
        ['Valor faturado, 12 meses (R$)', d.bills.billedLast12Months],
        ['Faturas pagas', d.bills.paid],
        ['Faturas a pagar', d.bills.open],
        ['Faturas vencidas', d.bills.overdue],
        ['Economia gerada aos clientes, 12 meses (R$)', d.bills.savingsLast12Months],
        ['Ofertas ativas do clube', d.club.activeOffers],
        ['Resgates do clube', d.club.redemptions],
        ['Indicações', d.club.indications],
        ['Indicações convertidas', d.club.indicationsApproved],
        ['Solo Coins emitidos', d.club.coinsIssued],
    ];
}

export default withAuth(AdminDashboardPage);
