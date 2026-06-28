'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { AccountBill } from '@/shared/controle/types'
import { useBillHistory } from './use-bill-history'
import { formatBRL } from '@/frontend/telemetry-kit'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

function capitalize(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1)
}

function billLabel(bill: AccountBill): string {
    const month = capitalize(
        format(new Date(bill.referenceYear, bill.referenceMonth - 1), 'MMMM', {
            locale: ptBR,
        }),
    )
    return `${month} ${bill.referenceYear} — ${bill.consumerUnitName}`
}

interface MetricRow {
    label: string
    value: (bill: AccountBill) => number
    lowerIsBetter: boolean
}

const METRICS: MetricRow[] = [
    { label: 'Você pagou', value: (b) => b.amountDue, lowerIsBetter: true },
    { label: 'Economia', value: (b) => b.estimatedSavings, lowerIsBetter: false },
    { label: 'Custo de energia', value: (b) => b.energyCost ?? 0, lowerIsBetter: true },
    { label: 'ICMS', value: (b) => b.icmsCost ?? 0, lowerIsBetter: true },
]

interface DeltaCellProps {
    delta: number
    lowerIsBetter: boolean
}

function DeltaCell({ delta, lowerIsBetter }: DeltaCellProps) {
    if (delta === 0) {
        return <span>{formatBRL(0)}</span>
    }
    const isFavorable = lowerIsBetter ? delta < 0 : delta > 0
    const colorClass = isFavorable ? 'text-success' : 'text-destructive'
    const sign = delta > 0 ? '+' : '−'
    const arrow = delta > 0 ? '↑' : '↓'
    const absAmount = formatBRL(Math.abs(delta))

    return (
        <span className={colorClass}>
            {sign}{absAmount} {arrow}
        </span>
    )
}

export function BillCompare() {
    const { bills, isLoading, error } = useBillHistory()
    const [leftId, setLeftId] = useState<string>('')
    const [rightId, setRightId] = useState<string>('')

    const billMap = useMemo(() => {
        if (!bills) return new Map<string, AccountBill>()
        return new Map(bills.map((b) => [b.id, b]))
    }, [bills])

    if (isLoading) {
        return (
            <div className="space-y-4 mt-6" data-testid="bill-compare-loading">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <Alert variant="destructive" className="mt-6" data-testid="bill-compare-error">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    if (!bills || bills.length < 2) {
        return (
            <p
                className="text-sm text-muted-foreground mt-6"
                data-testid="bill-compare-empty"
            >
                Você precisa de pelo menos duas contas para comparar.
            </p>
        )
    }

    const leftBill = leftId ? billMap.get(leftId) : undefined
    const rightBill = rightId ? billMap.get(rightId) : undefined
    const bothSelected = !!leftBill && !!rightBill

    return (
        <Card className="mt-6" data-testid="bill-compare">
            <CardHeader>
                <CardTitle>Comparar contas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                        <Select value={leftId} onValueChange={setLeftId}>
                            <SelectTrigger className="w-full" aria-label="Conta A">
                                <SelectValue placeholder="Selecione a primeira conta" />
                            </SelectTrigger>
                            <SelectContent>
                                {bills.map((bill) => (
                                    <SelectItem key={bill.id} value={bill.id}>
                                        {billLabel(bill)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <Select value={rightId} onValueChange={setRightId}>
                            <SelectTrigger className="w-full" aria-label="Conta B">
                                <SelectValue placeholder="Selecione a segunda conta" />
                            </SelectTrigger>
                            <SelectContent>
                                {bills.map((bill) => (
                                    <SelectItem key={bill.id} value={bill.id}>
                                        {billLabel(bill)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {!bothSelected && (
                    <p
                        className="text-sm text-muted-foreground"
                        data-testid="bill-compare-prompt"
                    >
                        Selecione duas contas para comparar.
                    </p>
                )}

                {bothSelected && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Métrica</TableHead>
                                <TableHead>{billLabel(leftBill)}</TableHead>
                                <TableHead>{billLabel(rightBill)}</TableHead>
                                <TableHead>Δ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {METRICS.map((metric) => {
                                const leftVal = metric.value(leftBill)
                                const rightVal = metric.value(rightBill)
                                const delta = rightVal - leftVal
                                return (
                                    <TableRow key={metric.label}>
                                        <TableCell>{metric.label}</TableCell>
                                        <TableCell>{formatBRL(leftVal)}</TableCell>
                                        <TableCell>{formatBRL(rightVal)}</TableCell>
                                        <TableCell>
                                            <DeltaCell
                                                delta={delta}
                                                lowerIsBetter={metric.lowerIsBetter}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}
