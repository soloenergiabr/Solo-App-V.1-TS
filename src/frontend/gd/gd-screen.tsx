'use client'

import { useState } from 'react'
import { Loader2, Mail, RefreshCw, Send, UserPlus, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PageLayout, PageHeader, PageEmpty } from '@/components/ui/page-layout'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { formatBRL } from '@/frontend/telemetry-kit'
import { CHARGE_MODE_LABEL } from '@/shared/gd/types'
import { ChargeStatusBadge } from './charge-status-badge'
import { ChargeRuleDialog } from './charge-rule-dialog'
import { InvitePayerDialog } from './invite-payer-dialog'
import {
    useChargeRules,
    useCharges,
    useConfirmChargePayment,
    useGenerateCharges,
    useSendCharge,
} from './hooks/use-gd'

const MONTHS = [
    'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function MetricCard({ label, value, tone }: { label: string; value: string; tone?: string }) {
    return (
        <div className="rounded-2xl border bg-card p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
            <div className={`mt-1 text-2xl font-semibold ${tone ?? 'text-foreground'}`}>{value}</div>
        </div>
    )
}

/**
 * Painel de geracao distribuida do titular: quem paga cada unidade, quanto deve
 * neste mes e o que ja foi recebido.
 */
export function GdScreen({ embedded, clientId }: { embedded?: boolean; clientId?: string }) {
    const now = new Date()
    // Competencia padrao: mes anterior — a fatura do mes corrente ainda nao chegou.
    const defaultDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const [year, setYear] = useState(defaultDate.getFullYear())
    const [month, setMonth] = useState(defaultDate.getMonth() + 1)
    const [actionError, setActionError] = useState<string | null>(null)

    const charges = useCharges(year, month, clientId)
    const rules = useChargeRules(clientId)
    const generate = useGenerateCharges(clientId)
    const send = useSendCharge(clientId)
    const confirm = useConfirmChargePayment(clientId)

    const summary = charges.data?.summary
    const list = charges.data?.charges ?? []

    function shiftMonth(delta: number) {
        const next = new Date(year, month - 1 + delta, 1)
        setYear(next.getFullYear())
        setMonth(next.getMonth() + 1)
    }

    async function run(action: () => Promise<unknown>) {
        setActionError(null)
        try {
            await action()
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Falha na operacao')
        }
    }

    const body = (
        <div className="space-y-6">
            {/* Seletor de competencia + gerar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => shiftMonth(-1)}>
                        Anterior
                    </Button>
                    <span className="min-w-40 text-center text-sm font-medium">
                        {MONTHS[month - 1]} / {year}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => shiftMonth(1)}>
                        Proximo
                    </Button>
                </div>
                <Button
                    onClick={() =>
                        run(() => generate.mutateAsync({ referenceYear: year, referenceMonth: month }))
                    }
                    disabled={generate.isPending}
                >
                    {generate.isPending ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                        <RefreshCw className="mr-2 size-4" />
                    )}
                    Gerar cobrancas do mes
                </Button>
            </div>

            {actionError && (
                <Alert variant="destructive">
                    <AlertTitle>Nao foi possivel concluir</AlertTitle>
                    <AlertDescription>{actionError}</AlertDescription>
                </Alert>
            )}

            {generate.data && generate.data.errors.length > 0 && (
                <Alert variant="destructive">
                    <AlertTitle>Algumas unidades ficaram de fora</AlertTitle>
                    <AlertDescription>
                        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                            {generate.data.errors.map((e) => (
                                <li key={e.consumerUnitId}>
                                    <strong>{e.consumerUnitName}:</strong> {e.message}
                                </li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}

            {/* Resumo do mes */}
            {charges.isLoading ? (
                <div className="grid gap-3 sm:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
            ) : summary ? (
                <div className="grid gap-3 sm:grid-cols-4">
                    <MetricCard label="Total cobrado" value={formatBRL(summary.totalCharged)} />
                    <MetricCard
                        label="Recebido"
                        value={formatBRL(summary.totalPaid)}
                        tone="text-success"
                    />
                    <MetricCard label="Em aberto" value={formatBRL(summary.totalOpen)} />
                    <MetricCard
                        label="Vencido"
                        value={formatBRL(summary.totalOverdue)}
                        tone={summary.totalOverdue > 0 ? 'text-destructive' : undefined}
                    />
                </div>
            ) : null}

            {/* Cobrancas da competencia */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Cobrancas de {MONTHS[month - 1]}</CardTitle>
                    <CardDescription>
                        Envie a cobranca ao responsavel e registre o recebimento.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {charges.isLoading && <Skeleton className="h-32 w-full" />}

                    {!charges.isLoading && charges.error && (
                        <Alert variant="destructive">
                            <AlertDescription>
                                {charges.error instanceof Error
                                    ? charges.error.message
                                    : 'Falha ao carregar cobrancas'}
                            </AlertDescription>
                        </Alert>
                    )}

                    {!charges.isLoading && !charges.error && list.length === 0 && (
                        <PageEmpty
                            icon={<Users className="h-8 w-8 text-muted-foreground" />}
                            title="Nenhuma cobranca nesta competencia"
                            description="Defina a regra de cobranca de cada unidade abaixo e clique em 'Gerar cobrancas do mes'."
                        />
                    )}

                    {list.length > 0 && (
                        <div className="w-full overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Unidade</TableHead>
                                        <TableHead>Responsavel</TableHead>
                                        <TableHead>Base</TableHead>
                                        <TableHead>Valor</TableHead>
                                        <TableHead>Vencimento</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Acoes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {list.map((charge) => (
                                        <TableRow key={charge.id}>
                                            <TableCell className="font-medium">
                                                {charge.consumerUnitName}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {charge.payerName ?? (
                                                    <span className="text-muted-foreground">
                                                        sem responsavel
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {charge.mode === 'per_kwh' && charge.basisKwh != null
                                                    ? `${charge.basisKwh.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kWh`
                                                    : CHARGE_MODE_LABEL[charge.mode]}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {formatBRL(charge.amount)}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {charge.dueDate
                                                    ? new Date(charge.dueDate).toLocaleDateString('pt-BR', {
                                                          timeZone: 'UTC',
                                                      })
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <ChargeStatusBadge status={charge.status} />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {charge.status !== 'paid' &&
                                                        charge.status !== 'canceled' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                disabled={send.isPending || !charge.payerEmail}
                                                                title={
                                                                    charge.payerEmail
                                                                        ? 'Enviar por e-mail'
                                                                        : 'Cadastre o e-mail do responsavel'
                                                                }
                                                                onClick={() =>
                                                                    run(() => send.mutateAsync(charge.id))
                                                                }
                                                            >
                                                                <Send className="size-3.5" />
                                                                <span className="ml-1">Enviar</span>
                                                            </Button>
                                                        )}
                                                    {charge.status !== 'paid' &&
                                                        charge.status !== 'canceled' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                disabled={confirm.isPending}
                                                                onClick={() =>
                                                                    run(() => confirm.mutateAsync(charge.id))
                                                                }
                                                            >
                                                                Recebi
                                                            </Button>
                                                        )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Regras por unidade */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Unidades e responsaveis</CardTitle>
                    <CardDescription>
                        Quem paga cada unidade e como o valor do mes e calculado.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {rules.isLoading && <Skeleton className="h-32 w-full" />}

                    {!rules.isLoading && rules.data && rules.data.length === 0 && (
                        <PageEmpty
                            icon={<Users className="h-8 w-8 text-muted-foreground" />}
                            title="Nenhuma unidade consumidora cadastrada"
                            description="Cadastre as unidades do imovel para comecar a ratear a energia e as contas."
                        />
                    )}

                    {rules.data && rules.data.length > 0 && (
                        <div className="w-full overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Unidade</TableHead>
                                        <TableHead>Responsavel</TableHead>
                                        <TableHead>Cobranca</TableHead>
                                        <TableHead>Acesso</TableHead>
                                        <TableHead className="text-right">Acoes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rules.data.map((rule) => (
                                        <TableRow key={rule.consumerUnitId}>
                                            <TableCell className="font-medium">
                                                {rule.consumerUnitName}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {rule.payerName ? (
                                                    <div>
                                                        <div>{rule.payerName}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {rule.payerEmail}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        nao definido
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {rule.isActive ? (
                                                    <div>
                                                        <div>{CHARGE_MODE_LABEL[rule.mode]}</div>
                                                        {rule.mode === 'per_kwh' && rule.pricePerKwh != null && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {formatBRL(rule.pricePerKwh)}/kWh
                                                            </div>
                                                        )}
                                                        {rule.mode === 'fixed' && rule.fixedAmount != null && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {formatBRL(rule.fixedAmount)}/mes
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        sem regra
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {rule.hasPayerLogin ? (
                                                    <span className="text-success">login ativo</span>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        sem login
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <ChargeRuleDialog
                                                        rule={rule}
                                                        clientId={clientId}
                                                        trigger={
                                                            <Button variant="outline" size="sm">
                                                                {rule.isActive ? 'Editar' : 'Definir'} cobranca
                                                            </Button>
                                                        }
                                                    />
                                                    {!rule.hasPayerLogin && (
                                                        <InvitePayerDialog
                                                            consumerUnitId={rule.consumerUnitId}
                                                            consumerUnitName={rule.consumerUnitName}
                                                            defaultName={rule.payerName}
                                                            defaultEmail={rule.payerEmail}
                                                            clientId={clientId}
                                                            trigger={
                                                                <Button variant="ghost" size="sm">
                                                                    <UserPlus className="size-3.5" />
                                                                    <span className="ml-1">Convidar</span>
                                                                </Button>
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <p className="flex items-start gap-2 text-xs text-muted-foreground">
                <Mail className="mt-0.5 size-3.5 shrink-0" />
                O Solo App calcula, envia e registra as cobrancas. O pagamento acontece fora do app,
                direto entre voce e o responsavel.
            </p>
        </div>
    )

    if (embedded) return <ErrorBoundary>{body}</ErrorBoundary>

    return (
        <PageLayout
            header={
                <PageHeader
                    title="Geracao Distribuida"
                    subtitle="Ratear a energia gerada e a conta entre os responsaveis de cada unidade"
                />
            }
        >
            <ErrorBoundary>{body}</ErrorBoundary>
        </PageLayout>
    )
}
