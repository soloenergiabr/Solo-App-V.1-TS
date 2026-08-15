'use client'

import { useState, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CHARGE_MODE_HINT, CHARGE_MODE_LABEL, type ChargeMode, type ChargeRuleDTO } from '@/shared/gd/types'
import { useSaveChargeRule } from './hooks/use-gd'

const MODES: ChargeMode[] = ['pass_through', 'per_kwh', 'fixed']

export function ChargeRuleDialog({
    rule,
    clientId,
    trigger,
}: {
    rule: ChargeRuleDTO
    clientId?: string
    trigger: ReactNode
}) {
    const [open, setOpen] = useState(false)
    const [mode, setMode] = useState<ChargeMode>(rule.mode)
    const [pricePerKwh, setPricePerKwh] = useState(rule.pricePerKwh?.toString() ?? '')
    const [fixedAmount, setFixedAmount] = useState(rule.fixedAmount?.toString() ?? '')
    const [dueDayOfMonth, setDueDayOfMonth] = useState(rule.dueDayOfMonth?.toString() ?? '')
    const [error, setError] = useState<string | null>(null)

    const save = useSaveChargeRule(clientId)

    async function handleSubmit() {
        setError(null)
        try {
            await save.mutateAsync({
                consumerUnitId: rule.consumerUnitId,
                mode,
                pricePerKwh: mode === 'per_kwh' ? Number(pricePerKwh.replace(',', '.')) : null,
                fixedAmount: mode === 'fixed' ? Number(fixedAmount.replace(',', '.')) : null,
                dueDayOfMonth: dueDayOfMonth ? Number(dueDayOfMonth) : null,
                isActive: true,
            })
            setOpen(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Falha ao salvar a regra')
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Como cobrar {rule.consumerUnitName}</DialogTitle>
                    <DialogDescription>
                        Defina o que o responsavel por esta unidade paga a cada mes.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <RadioGroup value={mode} onValueChange={(v) => setMode(v as ChargeMode)}>
                        {MODES.map((m) => (
                            <label
                                key={m}
                                htmlFor={`mode-${m}`}
                                className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 hover:bg-muted/50"
                            >
                                <RadioGroupItem value={m} id={`mode-${m}`} className="mt-1" />
                                <div className="space-y-0.5">
                                    <div className="text-sm font-medium">{CHARGE_MODE_LABEL[m]}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {CHARGE_MODE_HINT[m]}
                                    </div>
                                </div>
                            </label>
                        ))}
                    </RadioGroup>

                    {mode === 'per_kwh' && (
                        <div className="space-y-2">
                            <Label htmlFor="pricePerKwh">Preco por kWh (R$)</Label>
                            <Input
                                id="pricePerKwh"
                                inputMode="decimal"
                                placeholder="0,72"
                                value={pricePerKwh}
                                onChange={(e) => setPricePerKwh(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                O valor do mes sera a energia compensada da fatura multiplicada por
                                este preco.
                            </p>
                        </div>
                    )}

                    {mode === 'fixed' && (
                        <div className="space-y-2">
                            <Label htmlFor="fixedAmount">Valor fixo mensal (R$)</Label>
                            <Input
                                id="fixedAmount"
                                inputMode="decimal"
                                placeholder="350,00"
                                value={fixedAmount}
                                onChange={(e) => setFixedAmount(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="dueDayOfMonth">Dia de vencimento (opcional)</Label>
                        <Input
                            id="dueDayOfMonth"
                            inputMode="numeric"
                            placeholder="10"
                            value={dueDayOfMonth}
                            onChange={(e) => setDueDayOfMonth(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Sem preencher, a cobranca herda o vencimento da fatura da distribuidora.
                        </p>
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={save.isPending}>
                        {save.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                        Salvar regra
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
