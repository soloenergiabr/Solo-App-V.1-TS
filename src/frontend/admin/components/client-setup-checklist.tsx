'use client';

import Link from 'next/link';
import { CheckCircle2, Circle, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { AdminConsumerUnit, AdminEnergyBill, AdminInverter, AdminPlant } from '@/frontend/admin/hooks/use-admin-energy-management';

export type ClientTab = 'resumo' | 'plants' | 'bills' | 'faturapi' | 'generation' | 'gd';

type Unit = AdminConsumerUnit & { faturapiUnitId?: string | null; validationStatus?: string | null };
type Plant = AdminPlant & { validationStatus?: string | null };

export type SetupStep = {
    key: string;
    title: string;
    hint: string;
    done: boolean;
    optional?: boolean;
    tab: ClientTab;
    action: string;
};

/** Passos de configuracao de um cliente, na ordem em que o admin deve fazer. */
export function buildSetupSteps(input: {
    plants: Plant[];
    units: Unit[];
    inverters: AdminInverter[];
    bills: AdminEnergyBill[];
    hasInvestment: boolean;
}): SetupStep[] {
    const { plants, units, inverters, bills, hasInvestment } = input;
    return [
        {
            key: 'plant', title: 'Cadastrar a usina', tab: 'plants', action: 'Cadastrar usina',
            hint: 'A usina solar do cliente (nome, potência, endereço).',
            done: plants.length > 0,
        },
        {
            key: 'unit', title: 'Cadastrar as unidades consumidoras (UCs)', tab: 'plants', action: 'Cadastrar UC',
            hint: 'Cada conta de luz é uma UC. Informe o número do cliente que aparece na conta da Enel.',
            done: units.some((u) => !!u.clientNumber),
        },
        {
            key: 'inverter', title: 'Conectar o inversor', tab: 'plants', action: 'Conectar inversor', optional: true,
            hint: 'Traz a geração em tempo real. Sem inversor, lance a geração manualmente na aba Geração.',
            done: inverters.length > 0,
        },
        {
            key: 'faturapi', title: 'Ligar a busca automática de faturas', tab: 'faturapi', action: 'Conectar login da Enel',
            hint: 'Com o login da Enel do cliente, as faturas chegam sozinhas todo mês.',
            done: units.some((u) => !!u.faturapiUnitId),
        },
        {
            key: 'investment', title: 'Informar o investimento', tab: 'resumo', action: 'Preencher investimento',
            hint: 'Valor investido e data de início: alimentam o payback que o cliente vê.',
            done: hasInvestment,
        },
        {
            key: 'bill', title: 'Primeira fatura no sistema', tab: 'bills', action: 'Ver faturas',
            hint: 'Chega pela busca automática ou pode ser importada em PDF.',
            done: bills.length > 0,
        },
    ];
}

export function ClientSetupChecklist({
    steps,
    pendingApprovals,
    onNavigate,
}: {
    steps: SetupStep[];
    pendingApprovals: number;
    onNavigate: (tab: ClientTab, stepKey: string) => void;
}) {
    const required = steps.filter((s) => !s.optional);
    const doneCount = required.filter((s) => s.done).length;
    const next = steps.find((s) => !s.done && !s.optional) ?? steps.find((s) => !s.done);
    const complete = doneCount === required.length;

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <CardTitle>Configuração do cliente</CardTitle>
                        <CardDescription>
                            {complete
                                ? 'Tudo configurado. O cliente já vê geração, faturas e economia no app.'
                                : `${doneCount} de ${required.length} passos concluídos. Siga a ordem abaixo.`}
                        </CardDescription>
                    </div>
                    {next && (
                        <Button size="sm" onClick={() => onNavigate(next.tab, next.key)}>
                            Próximo: {next.action} <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                    )}
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(doneCount / required.length) * 100}%` }} />
                </div>
            </CardHeader>
            <CardContent className="space-y-1">
                {pendingApprovals > 0 && (
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm">
                        <span className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            {pendingApprovals} cadastro(s) deste cliente aguardando sua aprovação.
                        </span>
                        <Button asChild size="sm" variant="outline"><Link href="/admin/approvals">Revisar</Link></Button>
                    </div>
                )}
                {steps.map((step, index) => (
                    <button
                        key={step.key}
                        type="button"
                        onClick={() => onNavigate(step.tab, step.key)}
                        className={cn(
                            'flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted/60',
                            step === next && 'bg-muted/40',
                        )}
                    >
                        {step.done
                            ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                            : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
                        <span className="flex-1">
                            <span className={cn('text-sm font-medium', step.done && 'text-muted-foreground')}>
                                {index + 1}. {step.title}
                                {step.optional && <span className="ml-2 text-xs font-normal text-muted-foreground">(opcional)</span>}
                            </span>
                            {!step.done && <span className="block text-xs text-muted-foreground">{step.hint}</span>}
                        </span>
                        {!step.done && <span className="shrink-0 text-xs text-primary">{step.action} →</span>}
                    </button>
                ))}
            </CardContent>
        </Card>
    );
}
