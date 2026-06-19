'use client'

import { useState } from 'react'
import { FileText, ChevronLeft, CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { PageLayout, PageHeader } from '@/components/ui/page-layout'
import { CopyPixButton, formatBRL } from '@/frontend/telemetry-kit'
import { resolveBillStatus, statusToBadge } from '@/frontend/economia/lib/bill-status'
import { BillScoreRing } from './bill-score-ring'
import { LineItemExplanations } from './line-item-explanations'
import { AlertsPanel } from './alerts-panel'
import { RecommendationsPanel } from './recommendations-panel'
import type { BillDetail } from './types'

function monthName(m: number): string {
    const names = [
        'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ]
    return names[m - 1] ?? String(m)
}

export function BillAnalysisScreen({
    bill,
    isLoading,
    error,
}: {
    bill: BillDetail | null
    isLoading: boolean
    error: string | null
}) {
    /* ---------- Loading ---------- */
    if (isLoading) {
        return (
            <PageLayout
                header={
                    <PageHeader
                        title="Analise da Conta"
                        subtitle="Carregando..."
                    />
                }
            >
                <div className="space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <div className="flex justify-center">
                        <Skeleton className="size-32 rounded-full" />
                    </div>
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </PageLayout>
        )
    }

    /* ---------- Error ---------- */
    if (error) {
        return (
            <PageLayout
                header={
                    <PageHeader
                        title="Analise da Conta"
                        subtitle="Erro ao carregar"
                        actions={
                            <Link href="/economia">
                                <Button variant="ghost" size="sm">
                                    <ChevronLeft className="size-4" /> Voltar
                                </Button>
                            </Link>
                        }
                    />
                }
            >
                <Alert variant="destructive">
                    <AlertTitle>Erro ao carregar fatura</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </PageLayout>
        )
    }

    /* ---------- Empty / not found ---------- */
    if (!bill) {
        return (
            <PageLayout
                header={
                    <PageHeader
                        title="Analise da Conta"
                        subtitle="Fatura nao encontrada"
                        actions={
                            <Link href="/economia">
                                <Button variant="ghost" size="sm">
                                    <ChevronLeft className="size-4" /> Voltar
                                </Button>
                            </Link>
                        }
                    />
                }
            >
                <Alert>
                    <AlertTitle>Fatura nao encontrada</AlertTitle>
                    <AlertDescription>
                        A fatura solicitada nao esta disponivel ou foi removida.
                    </AlertDescription>
                </Alert>
            </PageLayout>
        )
    }

    const [isConfirming, setIsConfirming] = useState(false)
    const [confirmError, setConfirmError] = useState<string | null>(null)
    const [confirmedPaidAt, setConfirmedPaidAt] = useState<string | null>(null)

    // Allow local override once payment is confirmed in this session
    const effectivePaymentStatus = confirmedPaidAt ? 'paga' : bill.paymentStatus
    const effectivePaidAt = confirmedPaidAt ?? bill.paidAt

    async function handleConfirmPayment() {
        setIsConfirming(true)
        setConfirmError(null)
        try {
            const res = await fetch(`/api/economia/bills/${bill.id}/confirm-payment`, {
                method: 'POST',
            })
            const json = await res.json()
            if (!res.ok || !json.success) {
                setConfirmError(json.message ?? 'Falha ao confirmar pagamento')
                return
            }
            setConfirmedPaidAt(json.data.paidAt ?? new Date().toISOString())
        } catch (err) {
            setConfirmError(err instanceof Error ? err.message : 'Erro inesperado')
        } finally {
            setIsConfirming(false)
        }
    }

    const badge = statusToBadge(resolveBillStatus({ ...bill, paymentStatus: effectivePaymentStatus, paidAt: effectivePaidAt }))
    const refLabel = `${monthName(bill.referenceMonth)}/${bill.referenceYear}`
    const hasAiContent = bill.aiAnalysis || bill.aiExplanations || bill.alerts || bill.aiRecommendations

    return (
        <PageLayout
            header={
                <PageHeader
                    title="Analise da Conta"
                    subtitle={`${bill.consumerUnitName} — ${refLabel}`}
                    actions={
                        <Link href="/economia">
                            <Button variant="ghost" size="sm">
                                <ChevronLeft className="size-4" /> Voltar
                            </Button>
                        </Link>
                    }
                />
            }
        >
            <div className="mx-auto max-w-2xl space-y-6">
                {/* Status badge + distributor */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                        {bill.distributor ?? '—'}
                    </span>
                    <span
                        data-status={badge.tone}
                        className={
                            'rounded-full px-3 py-0.5 text-xs font-medium ' +
                            (badge.tone === 'success'
                                ? 'bg-success/10 text-success'
                                : badge.tone === 'warning'
                                  ? 'bg-warning/10 text-warning'
                                  : 'bg-destructive/10 text-destructive')
                        }
                    >
                        {badge.label}
                    </span>
                </div>

                {/* Score ring + amount */}
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
                    <BillScoreRing score={bill.billScore} size="lg" />
                    <div className="text-center sm:text-left">
                        <div className="font-display text-3xl font-bold text-foreground">
                            {formatBRL(bill.amountDue)}
                        </div>
                        {bill.estimatedSavings > 0 && (
                            <p className="mt-1 text-sm text-success">
                                Economia estimada: {formatBRL(bill.estimatedSavings)}
                            </p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                            Vencimento: {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('pt-BR') : '—'}
                        </p>
                    </div>
                </div>

                {/* Payment box */}
                {(bill.pixCode || bill.barcode) && effectivePaymentStatus !== 'paga' && (
                    <div className="rounded-2xl border bg-card p-4 space-y-3">
                        <h3 className="font-display text-sm font-semibold text-foreground">Pagamento</h3>
                        <div className="flex flex-wrap gap-2">
                            {bill.pixCode && <CopyPixButton code={bill.pixCode} />}
                            {bill.barcode && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => navigator.clipboard.writeText(bill.barcode!)}
                                >
                                    Copiar codigo de barras
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Confirm payment button */}
                {effectivePaymentStatus !== 'paga' && (
                    <div className="rounded-2xl border bg-card p-4 space-y-3">
                        <h3 className="font-display text-sm font-semibold text-foreground">Confirmar Pagamento</h3>
                        <p className="text-xs text-muted-foreground">
                            Ja pagou esta fatura? Confirme aqui para atualizar o status.
                        </p>
                        {confirmError && (
                            <Alert variant="destructive" className="py-2">
                                <AlertDescription className="text-xs">{confirmError}</AlertDescription>
                            </Alert>
                        )}
                        <Button
                            onClick={handleConfirmPayment}
                            disabled={isConfirming}
                            size="sm"
                            variant="default"
                        >
                            {isConfirming ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Confirmando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="size-4" />
                                    Confirmar Pagamento
                                </>
                            )}
                        </Button>
                    </div>
                )}

                {/* Paid badge */}
                {effectivePaymentStatus === 'paga' && (
                    <div className="rounded-2xl border bg-success/10 border-success/20 p-4 space-y-2">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-5 text-success" />
                            <span className="font-display text-sm font-semibold text-success">Paga</span>
                        </div>
                        {effectivePaidAt && (
                            <p className="text-xs text-muted-foreground">
                                Paga em {new Date(effectivePaidAt).toLocaleDateString('pt-BR')}
                            </p>
                        )}
                    </div>
                )}

                {/* PDF link */}
                {bill.billFileUrl && (
                    <Button asChild variant="outline" size="sm">
                        <a href={bill.billFileUrl} target="_blank" rel="noreferrer">
                            <FileText className="size-4" /> Ver fatura em PDF
                        </a>
                    </Button>
                )}

                {/* AI Analysis section */}
                {hasAiContent ? (
                    <>
                        {/* Executive summary */}
                        {bill.aiAnalysis && (
                            <div className="rounded-2xl border bg-card p-4">
                                <h3 className="font-display text-sm font-semibold text-foreground mb-2">
                                    Resumo da analise
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {bill.aiAnalysis}
                                </p>
                            </div>
                        )}

                        {/* Explanations */}
                        <LineItemExplanations explanations={bill.aiExplanations} />

                        {/* Alerts */}
                        <AlertsPanel alerts={bill.alerts} />

                        {/* Recommendations */}
                        <RecommendationsPanel recommendations={bill.aiRecommendations} />
                    </>
                ) : (
                    <Alert>
                        <AlertTitle>Analise em andamento</AlertTitle>
                        <AlertDescription>
                            Nossa inteligencia artificial esta analisando esta fatura. Assim que
                            estiver disponivel, os detalhes aparecerao aqui.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </PageLayout>
    )
}
