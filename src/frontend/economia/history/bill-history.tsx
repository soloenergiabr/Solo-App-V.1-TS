'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { AccountBill } from '@/shared/controle/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useBillHistory } from './use-bill-history'
import { formatBRL } from '@/frontend/telemetry-kit'
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { ExportMenu, downloadCsv } from '@/frontend/lib/export'

function capitalize(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1)
}

const statusConfig: Record<
    string,
    { variant: 'secondary' | 'outline' | 'destructive'; label: string }
> = {
    paga: { variant: 'secondary', label: 'Paga' },
    a_pagar: { variant: 'outline', label: 'A pagar' },
    vencida: { variant: 'destructive', label: 'Vencida' },
}

function exportBills(bills: AccountBill[]) {
    downloadCsv(
        'historico-de-contas',
        ['Mês/ano', 'UC', 'Consumo (kWh)', 'Compensado (kWh)', 'Valor (R$)', 'Economia (R$)', 'Vencimento', 'Status'],
        bills.map((bill) => [
            `${String(bill.referenceMonth).padStart(2, '0')}/${bill.referenceYear}`,
            bill.consumerUnitName,
            bill.consumptionKwh,
            bill.compensatedEnergyKwh,
            bill.amountDue,
            bill.estimatedSavings,
            // dueDate é @db.Date: formatar em UTC para não voltar um dia.
            bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : null,
            statusConfig[bill.paymentStatus]?.label ?? bill.paymentStatus,
        ]),
    )
}

export function BillHistory() {
    const { bills, isLoading, error } = useBillHistory()
    const router = useRouter()

    const grouped = useMemo(() => {
        if (!bills) return []
        const map = new Map<number, AccountBill[]>()
        for (const bill of bills) {
            const year = bill.referenceYear
            if (!map.has(year)) map.set(year, [])
            map.get(year)!.push(bill)
        }
        return Array.from(map.entries()).sort(([a], [b]) => b - a)
    }, [bills])

    if (isLoading) {
        return (
            <div className="space-y-4" data-testid="bill-history-loading">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <Alert variant="destructive" data-testid="bill-history-error">
                <AlertTitle>Erro ao carregar histórico</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    if (!bills || bills.length === 0) {
        return (
            <Alert data-testid="bill-history-empty">
                <AlertTitle>Nenhuma conta encontrada</AlertTitle>
                <AlertDescription>
                    Você ainda não tem contas no histórico.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-8" data-testid="bill-history-table">
            <div className="flex justify-end">
                <ExportMenu onCsv={() => exportBills(bills)} />
            </div>
            {grouped.map(([year, yearBills]) => (
                <section key={year}>
                    <h3 className="text-lg font-semibold mb-3">{year}</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mês</TableHead>
                                <TableHead className="hidden sm:table-cell">UC</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Economia</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {yearBills.map((bill) => (
                                <TableRow
                                    key={bill.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => router.push('/economia/' + bill.id)}
                                >
                                    <TableCell>
                                        {capitalize(
                                            format(
                                                new Date(bill.referenceYear, bill.referenceMonth - 1),
                                                'MMMM',
                                                { locale: ptBR },
                                            ),
                                        )}
                                        {/* No celular a UC vai embaixo do mês para a tabela caber na tela. */}
                                        <span className="block text-muted-foreground sm:hidden">{bill.consumerUnitName}</span>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">{bill.consumerUnitName}</TableCell>
                                    <TableCell>{formatBRL(bill.amountDue)}</TableCell>
                                    <TableCell>{formatBRL(bill.estimatedSavings)}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                statusConfig[bill.paymentStatus]?.variant ?? 'outline'
                                            }
                                        >
                                            {statusConfig[bill.paymentStatus]?.label ??
                                                bill.paymentStatus}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </section>
            ))}
        </div>
    )
}
