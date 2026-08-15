'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { PageEmpty } from '@/components/ui/page-layout'
import { formatBRL } from '@/frontend/telemetry-kit'
import { CHARGE_MODE_LABEL } from '@/shared/gd/types'
import { ChargeStatusBadge } from './charge-status-badge'
import { useCharges, useConfirmChargePayment } from './hooks/use-gd'

/**
 * O que o responsavel (inquilino) ve: apenas a conta da unidade dele, com a
 * conta de energia explicada e o botao de confirmar pagamento.
 */
export function PayerCharges() {
    const now = new Date()
    const defaultDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const [year] = useState(defaultDate.getFullYear())
    const [month] = useState(defaultDate.getMonth() + 1)
    const [error, setError] = useState<string | null>(null)

    const { data, isLoading } = useCharges(year, month)
    const confirm = useConfirmChargePayment()

    const charges = data?.charges ?? []

    async function handleConfirm(chargeId: string) {
        setError(null)
        try {
            await confirm.mutateAsync(chargeId)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Falha ao confirmar pagamento')
        }
    }

    if (isLoading) return <Skeleton className="h-40 w-full" />

    if (charges.length === 0) {
        return (
            <PageEmpty
                icon={<Zap className="h-8 w-8 text-muted-foreground" />}
                title="Nenhuma conta neste mes"
                description="Assim que o titular gerar a conta desta competencia, ela aparece aqui."
            />
        )
    }

    return (
        <div className="space-y-4" data-slot="payer-charges">
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {charges.map((charge) => (
                <Card key={charge.id}>
                    <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <CardTitle className="text-lg">{charge.consumerUnitName}</CardTitle>
                                <CardDescription>
                                    Competencia {String(charge.referenceMonth).padStart(2, '0')}/
                                    {charge.referenceYear}
                                </CardDescription>
                            </div>
                            <ChargeStatusBadge status={charge.status} />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                Valor a pagar
                            </div>
                            <div className="text-3xl font-semibold">{formatBRL(charge.amount)}</div>
                            <div className="mt-1 text-xs text-muted-foreground">
                                {charge.mode === 'per_kwh' && charge.basisKwh != null && charge.pricePerKwh != null
                                    ? `${charge.basisKwh.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kWh fornecidos x ${formatBRL(charge.pricePerKwh)}/kWh`
                                    : CHARGE_MODE_LABEL[charge.mode]}
                            </div>
                        </div>

                        {charge.dueDate && (
                            <div className="text-sm">
                                Vencimento:{' '}
                                <strong>
                                    {new Date(charge.dueDate).toLocaleDateString('pt-BR', {
                                        timeZone: 'UTC',
                                    })}
                                </strong>
                            </div>
                        )}

                        {charge.status !== 'paid' && charge.status !== 'canceled' && (
                            <Button
                                onClick={() => handleConfirm(charge.id)}
                                disabled={confirm.isPending}
                            >
                                {confirm.isPending ? (
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="mr-2 size-4" />
                                )}
                                Ja paguei
                            </Button>
                        )}

                        {charge.status === 'paid' && charge.paidAt && (
                            <p className="text-sm text-success">
                                Pagamento registrado em{' '}
                                {new Date(charge.paidAt).toLocaleDateString('pt-BR')}
                            </p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
