'use client';

import { type ComponentType, type ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    ArrowLeft,
    BadgeDollarSign,
    Battery,
    Building2,
    Cable,
    Check,
    ChevronsUpDown,
    FileText,
    Loader2,
    Plus,
    Split,
    Trash2,
    Upload,
    UserCog,
    Wallet,
    Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { resolveBillStatus, statusToBadge } from '@/frontend/economia/lib/bill-status';
import { ManualTransactionDialog } from './manual-transaction-dialog';
import { useGenerationDashboard } from '@/frontend/generation/hooks/use-generation-dashboard';
import { CompactMetrics } from '@/frontend/generation/components/dashboard/compact-metrics';
import { PeriodTabs } from '@/frontend/generation/components/dashboard/period-tabs';
import { AdaptiveChart } from '@/frontend/generation/components/dashboard/adaptive-chart';
import {
    AdminConsumerUnit,
    AdminCreditAllocation,
    AdminClientDetails,
    AdminEnergyBill,
    AdminInverter,
    AdminPlant,
    useAdminClientDetails,
    useAdminConsumerUnits,
    useAdminCreditAllocations,
    useAdminEnergyBills,
    useAdminInverters,
    useAdminInvestment,
    useAdminPayers,
    useAdminPlants,
    useAdminProviderPlants,
} from '@/frontend/admin/hooks/use-admin-energy-management';

interface ClientDetailsProps {
    clientId: string;
}

function toNumber(value: unknown): number {
    if (value === null || value === undefined || value === '') return 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function currency(value: unknown): string {
    return toNumber(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function kwh(value: unknown): string {
    return `${toNumber(value).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} kWh`;
}

function monthYear(bill: AdminEnergyBill): string {
    return `${String(bill.referenceMonth).padStart(2, '0')}/${bill.referenceYear}`;
}

function remainingCredits(bill: AdminEnergyBill): number {
    if (bill.currentCreditsKwh !== null && bill.currentCreditsKwh !== undefined) {
        return toNumber(bill.currentCreditsKwh);
    }
    return Math.max(0, toNumber(bill.injectedEnergyKwh) - toNumber(bill.compensatedEnergyKwh));
}

function errorMessage(error: unknown, fallback: string): string {
    if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { message?: unknown } } }).response?.data?.message === 'string'
    ) {
        return (error as { response: { data: { message: string } } }).response.data.message;
    }
    return fallback;
}

function EmptyState({ icon: Icon, title, description }: { icon: ComponentType<{ className?: string }>; title: string; description: string }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-12 text-center">
            <Icon className="mb-3 h-9 w-9 text-muted-foreground" />
            <p className="font-medium">{title}</p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

function PlantUnitsSection({ plant, units, clientId }: { plant: AdminPlant; units: AdminConsumerUnit[]; clientId: string }) {
    const unitMutations = useAdminConsumerUnits(clientId);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        name: '',
        clientNumber: '',
        installationNumber: '',
        accountHolder: '',
        accountNumber: '',
        distributor: '',
        city: '',
        state: '',
        status: 'active',
        isGenerator: true,
        isConsumer: true,
    });

    const submit = async () => {
        try {
            await unitMutations.create.mutateAsync({ ...form, plantId: plant.id } satisfies Partial<AdminConsumerUnit>);
            setOpen(false);
            toast.success('Unidade criada com sucesso');
            setForm(prev => ({ ...prev, name: '', clientNumber: '', installationNumber: '', accountHolder: '', accountNumber: '' }));
        } catch (error: unknown) {
            toast.error(errorMessage(error, 'Erro ao criar unidade'));
        }
    };

    const remove = async (unit: AdminConsumerUnit) => {
        if (!window.confirm(`Remover a unidade ${unit.name || unit.id}?`)) return;
        try {
            await unitMutations.remove.mutateAsync(unit.id);
            toast.success('Unidade removida');
        } catch (error: unknown) {
            toast.error(errorMessage(error, 'Erro ao remover unidade'));
        }
    };

    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h3 className="font-medium">Unidades consumidoras</h3>
                    <p className="text-sm text-muted-foreground">Unidades vinculadas a esta usina.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline"><Plus className="mr-2 h-4 w-4" />Unidade</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[780px]">
                        <DialogHeader>
                            <DialogTitle>Nova unidade para {plant.name || 'usina'}</DialogTitle>
                            <DialogDescription>Defina se a unidade gera créditos, consome créditos, ou ambos.</DialogDescription>
                        </DialogHeader>
                        <FormSection title="Dados da conta">
                            <Field label="Nome" placeholder="Ex: Casa principal" value={form.name} onChange={value => setForm(prev => ({ ...prev, name: value }))} />
                            <Field label="Número do cliente" value={form.clientNumber} onChange={value => setForm(prev => ({ ...prev, clientNumber: value }))} />
                            <Field label="Número da instalação" value={form.installationNumber} onChange={value => setForm(prev => ({ ...prev, installationNumber: value }))} />
                            <Field label="Titular" value={form.accountHolder} onChange={value => setForm(prev => ({ ...prev, accountHolder: value }))} />
                            <Field label="Conta" value={form.accountNumber} onChange={value => setForm(prev => ({ ...prev, accountNumber: value }))} />
                            <Field label="Distribuidora" value={form.distributor} onChange={value => setForm(prev => ({ ...prev, distributor: value }))} />
                        </FormSection>
                        <FormSection title="Local e papel da unidade">
                            <Field label="Cidade" value={form.city} onChange={value => setForm(prev => ({ ...prev, city: value }))} />
                            <Field label="Estado" value={form.state} onChange={value => setForm(prev => ({ ...prev, state: value }))} />
                            <SwitchField label="Pode gerar créditos" checked={form.isGenerator} onChange={value => setForm(prev => ({ ...prev, isGenerator: value }))} />
                            <SwitchField label="Pode receber créditos" checked={form.isConsumer} onChange={value => setForm(prev => ({ ...prev, isConsumer: value }))} />
                        </FormSection>
                        <DialogFooter>
                            <Button onClick={submit} disabled={unitMutations.create.isPending}>Salvar unidade</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            {units.length === 0 ? (
                <EmptyState icon={Cable} title="Nenhuma unidade nesta usina" description="Cadastre pelo menos uma unidade geradora para liberar rateios de créditos." />
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Unidade</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Instalação</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {units.map(unit => (
                            <TableRow key={unit.id}>
                                <TableCell className="font-medium">{unit.name || unit.accountHolder || '-'}</TableCell>
                                <TableCell>{unit.clientNumber || '-'}</TableCell>
                                <TableCell>{unit.installationNumber || '-'}</TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        {unit.isGenerator && <Badge variant="secondary">Geradora</Badge>}
                                        {unit.isConsumer && <Badge variant="outline">Consumidora</Badge>}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => remove(unit)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </section>
    );
}

function PlantAllocationsSection({
    plant,
    units,
    allocations,
    clientId,
}: {
    plant: AdminPlant;
    units: AdminConsumerUnit[];
    allocations: AdminCreditAllocation[];
    clientId: string;
}) {
    const allocationMutations = useAdminCreditAllocations(clientId);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ fromId: '', toId: '', allocationPercentage: '', startsAt: '', endsAt: '', isActive: true });
    const generatorUnits = units.filter(unit => unit.isGenerator);
    const consumerUnits = units.filter(unit => unit.isConsumer);

    const submit = async () => {
        try {
            await allocationMutations.create.mutateAsync({
                plantId: plant.id,
                fromId: form.fromId,
                toId: form.toId,
                allocationPercentage: Number(form.allocationPercentage),
                startsAt: form.startsAt || undefined,
                endsAt: form.endsAt || undefined,
                isActive: form.isActive,
            } satisfies Partial<AdminCreditAllocation>);
            setOpen(false);
            toast.success('Rateio criado com sucesso');
            setForm({ fromId: '', toId: '', allocationPercentage: '', startsAt: '', endsAt: '', isActive: true });
        } catch (error: unknown) {
            toast.error(errorMessage(error, 'Erro ao criar rateio'));
        }
    };

    const remove = async (allocation: AdminCreditAllocation) => {
        if (!window.confirm('Remover este rateio?')) return;
        try {
            await allocationMutations.remove.mutateAsync(allocation.id);
            toast.success('Rateio removido');
        } catch (error: unknown) {
            toast.error(errorMessage(error, 'Erro ao remover rateio'));
        }
    };

    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h3 className="font-medium">Rateios de crédito</h3>
                    <p className="text-sm text-muted-foreground">A origem mostra apenas unidades marcadas como geradoras.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline" disabled={generatorUnits.length === 0 || consumerUnits.length === 0}>
                            <Plus className="mr-2 h-4 w-4" />Rateio
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[620px]">
                        <DialogHeader>
                            <DialogTitle>Novo rateio para {plant.name || 'usina'}</DialogTitle>
                            <DialogDescription>Selecione uma unidade geradora como origem e uma unidade consumidora como destino.</DialogDescription>
                        </DialogHeader>
                        <FormSection title="Créditos">
                            <SearchSelectField label="Origem geradora" value={form.fromId} onChange={value => setForm(prev => ({ ...prev, fromId: value }))} options={generatorUnits.map(unit => ({ value: unit.id, label: unit.name || unit.clientNumber || unit.id }))} />
                            <SearchSelectField label="Destino consumidor" value={form.toId} onChange={value => setForm(prev => ({ ...prev, toId: value }))} options={consumerUnits.map(unit => ({ value: unit.id, label: unit.name || unit.clientNumber || unit.id }))} />
                            <Field label="Percentual (%)" type="number" value={form.allocationPercentage} onChange={value => setForm(prev => ({ ...prev, allocationPercentage: value }))} />
                            <SwitchField label="Rateio ativo" checked={form.isActive} onChange={value => setForm(prev => ({ ...prev, isActive: value }))} />
                        </FormSection>
                        <FormSection title="Vigência">
                            <Field label="Início" type="date" value={form.startsAt} onChange={value => setForm(prev => ({ ...prev, startsAt: value }))} />
                            <Field label="Fim" type="date" value={form.endsAt} onChange={value => setForm(prev => ({ ...prev, endsAt: value }))} />
                        </FormSection>
                        <DialogFooter>
                            <Button onClick={submit} disabled={!form.fromId || !form.toId || allocationMutations.create.isPending}>Salvar rateio</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            {allocations.length === 0 ? (
                <EmptyState icon={Split} title="Nenhum rateio nesta usina" description="Crie rateios para acompanhar a distribuição dos créditos gerados." />
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Origem</TableHead>
                            <TableHead>Destino</TableHead>
                            <TableHead>Percentual</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allocations.map(allocation => (
                            <TableRow key={allocation.id}>
                                <TableCell>{allocation.from?.name || allocation.from?.clientNumber || allocation.fromId}</TableCell>
                                <TableCell>{allocation.to?.name || allocation.to?.clientNumber || allocation.toId}</TableCell>
                                <TableCell>{toNumber(allocation.allocationPercentage).toLocaleString('pt-BR')}%</TableCell>
                                <TableCell><Badge variant={allocation.isActive ? 'default' : 'secondary'}>{allocation.isActive ? 'Ativo' : 'Inativo'}</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => remove(allocation)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </section>
    );
}

function PlantInvertersSection({
    plant,
    inverters,
    mutations,
}: {
    plant: AdminPlant;
    inverters: AdminInverter[];
    mutations: ReturnType<typeof useAdminInverters>;
}) {
    const remove = async (inverter: AdminInverter) => {
        if (!window.confirm(`Remover o inversor ${inverter.name || inverter.providerId}?`)) return;
        try {
            await mutations.remove.mutateAsync(inverter.id);
            toast.success('Inversor removido');
        } catch (error: unknown) {
            toast.error(errorMessage(error, 'Erro ao remover inversor'));
        }
    };

    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h3 className="font-medium">Inversores</h3>
                    <p className="text-sm text-muted-foreground">Equipamentos vinculados a esta usina.</p>
                </div>
                <AddInverterDialog plant={plant} mutations={mutations} />
            </div>
            {inverters.length === 0 ? (
                <EmptyState icon={Zap} title="Nenhum inversor nesta usina" description="Registre inversores para alimentar o dashboard de geração." />
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Provedor</TableHead>
                            <TableHead>ID</TableHead>
                            <TableHead>Hardware</TableHead>
                            <TableHead>Sync</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {inverters.map(inverter => (
                            <TableRow key={inverter.id}>
                                <TableCell className="font-medium">{inverter.name || inverter.provider}</TableCell>
                                <TableCell>{inverter.provider}</TableCell>
                                <TableCell>{inverter.providerId}</TableCell>
                                <TableCell>{[inverter.manufacturer, inverter.modelName, inverter.serialNumber].filter(Boolean).join(' / ') || '-'}</TableCell>
                                <TableCell><Badge variant={inverter.syncEnabled ? 'default' : 'secondary'}>{inverter.lastSyncStatus || (inverter.syncEnabled ? 'Ativo' : 'Pausado')}</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => remove(inverter)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </section>
    );
}

function AddInverterDialog({ plant, mutations }: { plant: AdminPlant; mutations: ReturnType<typeof useAdminInverters> }) {
    const [open, setOpen] = useState(false);
    const [provider, setProvider] = useState('');
    const providerPlants = useAdminProviderPlants(provider);
    const [form, setForm] = useState({
        name: '',
        providerId: '',
        providerPlantId: plant.providerPlantId || '',
        providerPlantName: plant.name || '',
        serialNumber: '',
        manufacturer: '',
        modelName: '',
        firmwareVersion: '',
        nominalPowerKw: '',
        timezone: plant.timezone || 'America/Fortaleza',
        syncEnabled: true,
        syncIntervalMinutes: '15',
    });
    const providerOptions = ['solis', 'solplanet', 'growatt', 'deye', 'hoymiles', 'mock', 'other'].map(value => ({ value, label: value }));

    const submit = async () => {
        try {
            await mutations.create.mutateAsync({
                ...form,
                provider,
                plantId: plant.id,
                nominalPowerKw: form.nominalPowerKw ? Number(form.nominalPowerKw) : undefined,
                syncIntervalMinutes: form.syncIntervalMinutes ? Number(form.syncIntervalMinutes) : undefined,
            } satisfies Partial<AdminInverter>);
            setOpen(false);
            toast.success('Inversor registrado com sucesso');
            setProvider('');
            setForm(prev => ({ ...prev, name: '', providerId: '', serialNumber: '', modelName: '' }));
        } catch (error: unknown) {
            toast.error(errorMessage(error, 'Erro ao registrar inversor'));
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline"><Plus className="mr-2 h-4 w-4" />Inversor</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[780px]">
                <DialogHeader>
                    <DialogTitle>Registrar inversor em {plant.name || 'usina'}</DialogTitle>
                    <DialogDescription>Conecte o inversor à usina e salve os dados de sincronização.</DialogDescription>
                </DialogHeader>
                <FormSection title="Provedor">
                    <SearchSelectField label="Provedor" value={provider} onChange={setProvider} options={providerOptions} />
                    <Field label="ID do inversor no provedor" value={form.providerId} onChange={value => setForm(prev => ({ ...prev, providerId: value }))} />
                    {providerPlants.data && providerPlants.data.length > 0 && (
                        <SearchSelectField
                            label="Autocompletar planta do provedor"
                            value={form.providerPlantId}
                            onChange={(value) => {
                                const selected = providerPlants.data?.find(item => item.id === value);
                                setForm(prev => ({
                                    ...prev,
                                    providerPlantId: value,
                                    providerPlantName: selected?.name || prev.providerPlantName,
                                    providerId: prev.providerId || value,
                                    name: prev.name || selected?.name || prev.name,
                                }));
                            }}
                            options={providerPlants.data.map(item => ({ value: item.id, label: `${item.name} (${item.id})` }))}
                        />
                    )}
                    <Field label="Nome" value={form.name} onChange={value => setForm(prev => ({ ...prev, name: value }))} />
                </FormSection>
                <FormSection title="Hardware e sincronizacao">
                    <Field label="Serial" value={form.serialNumber} onChange={value => setForm(prev => ({ ...prev, serialNumber: value }))} />
                    <Field label="Fabricante" value={form.manufacturer} onChange={value => setForm(prev => ({ ...prev, manufacturer: value }))} />
                    <Field label="Modelo" value={form.modelName} onChange={value => setForm(prev => ({ ...prev, modelName: value }))} />
                    <Field label="Firmware" value={form.firmwareVersion} onChange={value => setForm(prev => ({ ...prev, firmwareVersion: value }))} />
                    <Field label="Potência nominal (kW)" type="number" value={form.nominalPowerKw} onChange={value => setForm(prev => ({ ...prev, nominalPowerKw: value }))} />
                    <Field label="Intervalo sync (min)" type="number" value={form.syncIntervalMinutes} onChange={value => setForm(prev => ({ ...prev, syncIntervalMinutes: value }))} />
                    <SwitchField label="Sincronizacao ativa" checked={form.syncEnabled} onChange={value => setForm(prev => ({ ...prev, syncEnabled: value }))} />
                </FormSection>
                <DialogFooter>
                    <Button onClick={submit} disabled={!provider || !form.providerId || mutations.create.isPending}>Salvar inversor</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function ClientDetails({ clientId }: ClientDetailsProps) {
    const router = useRouter();
    const clientDetails = useAdminClientDetails(clientId);
    const plants = useAdminPlants(clientId);
    const units = useAdminConsumerUnits(clientId);
    const allocations = useAdminCreditAllocations(clientId);
    const bills = useAdminEnergyBills(clientId);
    const {
        analytics,
        filters,
        updateFilters,
        refetch,
        goToPreviousPeriod,
        goToNextPeriod,
        goToToday,
        getCurrentPeriodLabel,
    } = useGenerationDashboard({ clientId });

    const isLoading = clientDetails.isLoading || plants.isLoading || units.isLoading || allocations.isLoading || bills.isLoading;

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!clientDetails.data) {
        return (
            <div className="py-8 text-center">
                <p className="text-muted-foreground">Cliente não encontrado.</p>
                <Button variant="link" onClick={() => router.back()}>
                    Voltar
                </Button>
            </div>
        );
    }

    const client = clientDetails.data.client;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                    </div>
                    <Badge variant={client.status === 'client' ? 'default' : 'secondary'}>{client.status}</Badge>
                </div>
                <ManualTransactionDialog clientId={clientId} onSuccess={() => clientDetails.refetch()} />
            </div>

            <Tabs defaultValue="resumo" className="w-full">
                <TabsList className="flex h-auto flex-wrap justify-start">
                    <TabsTrigger value="resumo">Resumo</TabsTrigger>
                    <TabsTrigger value="plants">Usinas e Estrutura</TabsTrigger>
                    <TabsTrigger value="bills">Faturas</TabsTrigger>
                    <TabsTrigger value="generation">Dashboard de Geração</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="mt-6 space-y-6">
                    <SummaryTab
                        clientId={clientId}
                        client={client}
                        balance={clientDetails.data.balance}
                        plants={plants.plants}
                        units={units.consumerUnits}
                        bills={bills.bills}
                        inverters={clientDetails.data.inverters}
                    />
                </TabsContent>

                <TabsContent value="plants" className="mt-6">
                    <PlantsTab clientId={clientId} inverters={clientDetails.data.inverters} />
                </TabsContent>

                <TabsContent value="bills" className="mt-6">
                    <EnergyBillsTab clientId={clientId} />
                </TabsContent>

                <TabsContent value="generation" className="mt-6 space-y-6">
                    {analytics ? (
                        <>
                            <CompactMetrics analytics={analytics} isRealTime={filters.generationUnitType === 'real_time'} />
                            <PeriodTabs
                                filters={filters}
                                currentPeriodLabel={getCurrentPeriodLabel()}
                                onUpdateFilters={updateFilters}
                                onPreviousPeriod={goToPreviousPeriod}
                                onNextPeriod={goToNextPeriod}
                                onToday={goToToday}
                                onRefresh={refetch}
                                isLoading={false}
                            />
                            <AdaptiveChart analytics={analytics} viewType={filters.generationUnitType} />
                        </>
                    ) : (
                        <Card>
                            <CardContent className="flex h-48 flex-col items-center justify-center py-12 text-center">
                                <p className="text-muted-foreground">O dashboard de geração aparecerá aqui após o registro dos inversores.</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

function toDateInput(value?: string | null): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
}

function InvestmentSection({ clientId }: { clientId: string }) {
    const investment = useAdminInvestment(clientId);
    const [form, setForm] = useState({ totalInvested: '', startDate: '', expectedPayoff: '', monthlyReturn: '' });
    const [hydrated, setHydrated] = useState(false);

    // Hydrate the form once from the loaded investment.
    if (!hydrated && investment.data !== undefined) {
        if (investment.data) {
            setForm({
                totalInvested: String(toNumber(investment.data.totalInvested) || ''),
                startDate: toDateInput(investment.data.startDate),
                expectedPayoff: toDateInput(investment.data.expectedPayoff),
                monthlyReturn: investment.data.monthlyReturn != null ? String(toNumber(investment.data.monthlyReturn)) : '',
            });
        }
        setHydrated(true);
    }

    const save = async () => {
        if (!form.totalInvested || !form.startDate) {
            toast.error('Informe o valor investido e a data de início');
            return;
        }
        try {
            await investment.save.mutateAsync({
                totalInvested: Number(form.totalInvested),
                startDate: form.startDate,
                expectedPayoff: form.expectedPayoff || null,
                monthlyReturn: form.monthlyReturn ? Number(form.monthlyReturn) : null,
            } as never);
            toast.success('Investimento salvo com sucesso');
        } catch (error: unknown) {
            toast.error(errorMessage(error, 'Erro ao salvar investimento'));
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <CardTitle>Investimento</CardTitle>
                </div>
                <CardDescription>Define o custo do sistema que alimenta o payback do cliente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Valor investido (R$)" type="number" value={form.totalInvested} onChange={value => setForm(prev => ({ ...prev, totalInvested: value }))} />
                    <Field label="Data de início" type="date" value={form.startDate} onChange={value => setForm(prev => ({ ...prev, startDate: value }))} />
                    <Field label="Payback esperado" type="date" value={form.expectedPayoff} onChange={value => setForm(prev => ({ ...prev, expectedPayoff: value }))} />
                    <Field label="Retorno mensal (R$, opcional)" type="number" value={form.monthlyReturn} onChange={value => setForm(prev => ({ ...prev, monthlyReturn: value }))} />
                </div>
                <Button onClick={save} disabled={investment.save.isPending}>
                    {investment.save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar investimento
                </Button>
            </CardContent>
        </Card>
    );
}

function SummaryTab({
    clientId,
    client,
    balance,
    plants,
    units,
    bills,
    inverters,
}: {
    clientId: string;
    client: AdminClientDetails['client'];
    balance: number;
    plants: AdminPlant[];
    units: AdminConsumerUnit[];
    bills: AdminEnergyBill[];
    inverters: AdminInverter[];
}) {
    const latestBill = bills[0];

    return (
        <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
                        <Battery className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{balance} Solo Coins</div>
                        <p className="text-xs text-muted-foreground">Disponível para resgate</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Usinas</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{plants.length}</div>
                        <p className="text-xs text-muted-foreground">{inverters.length} inversores conectados</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unidades</CardTitle>
                        <Cable className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{units.length}</div>
                        <p className="text-xs text-muted-foreground">Geradoras e consumidoras</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Última Fatura</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{latestBill ? monthYear(latestBill) : '-'}</div>
                        <p className="text-xs text-muted-foreground">{latestBill ? currency(latestBill.totalBillValue ?? latestBill.totalAmount) : 'Nenhuma fatura'}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informações do Cliente</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
                    <Info label="Email" value={client.email} />
                    <Info label="CPF/CNPJ" value={client.cpfCnpj} />
                    <Info label="Telefone" value={client.phone || '-'} />
                    <Info label="Endereço" value={client.address || '-'} />
                    <Info label="Cadastrado em" value={new Date(client.createdAt).toLocaleDateString('pt-BR')} />
                    <Info label="Atualizado em" value={new Date(client.updatedAt).toLocaleDateString('pt-BR')} />
                </CardContent>
            </Card>

            <InvestmentSection clientId={clientId} />
        </>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid grid-cols-[140px_1fr] gap-2">
            <span className="text-muted-foreground">{label}:</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}

function PlantsTab({ clientId, inverters }: { clientId: string; inverters: AdminInverter[] }) {
    const plants = useAdminPlants(clientId);
    const units = useAdminConsumerUnits(clientId);
    const allocations = useAdminCreditAllocations(clientId);
    const inverterMutations = useAdminInverters(clientId);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        name: '',
        provider: '',
        providerPlantId: '',
        installedPowerKw: '',
        city: '',
        state: '',
        timezone: '',
    });

    const submit = async () => {
        try {
            await plants.create.mutateAsync({
                ...form,
                installedPowerKw: form.installedPowerKw ? Number(form.installedPowerKw) : undefined,
            } satisfies Partial<AdminPlant>);
            toast.success('Usina criada com sucesso');
            setOpen(false);
            setForm({ name: '', provider: '', providerPlantId: '', installedPowerKw: '', city: '', state: '', timezone: '' });
        } catch (error: unknown) {
            toast.error(errorMessage(error, 'Erro ao criar usina'));
        }
    };

    const remove = async (plant: AdminPlant) => {
        if (!window.confirm(`Remover a usina ${plant.name || plant.id}?`)) return;
        try {
            await plants.remove.mutateAsync(plant.id);
            toast.success('Usina removida');
        } catch (error: unknown) {
            toast.error(errorMessage(error, 'Erro ao remover usina'));
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Usinas</CardTitle>
                    <CardDescription>Cadastre as plantas solares do cliente e relacione inversores e unidades.</CardDescription>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm"><Plus className="mr-2 h-4 w-4" />Nova Usina</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[640px]">
                        <DialogHeader>
                            <DialogTitle>Nova Usina</DialogTitle>
                            <DialogDescription>Informe os dados principais da planta solar.</DialogDescription>
                        </DialogHeader>
                        <FormSection title="Identificação">
                            <Field label="Nome da usina" placeholder="Ex: Casa Praia" value={form.name} onChange={value => setForm(prev => ({ ...prev, name: value }))} />
                            <Field label="Provedor" placeholder="Solis, Deye, Hoymiles..." value={form.provider} onChange={value => setForm(prev => ({ ...prev, provider: value }))} />
                            <Field label="ID no provedor" value={form.providerPlantId} onChange={value => setForm(prev => ({ ...prev, providerPlantId: value }))} />
                            <Field label="Potência instalada (kW)" type="number" value={form.installedPowerKw} onChange={value => setForm(prev => ({ ...prev, installedPowerKw: value }))} />
                        </FormSection>
                        <FormSection title="Localização">
                            <Field label="Cidade" value={form.city} onChange={value => setForm(prev => ({ ...prev, city: value }))} />
                            <Field label="Estado" value={form.state} onChange={value => setForm(prev => ({ ...prev, state: value }))} />
                            <Field label="Timezone" value={form.timezone} placeholder="America/Fortaleza" onChange={value => setForm(prev => ({ ...prev, timezone: value }))} />
                        </FormSection>
                        <DialogFooter>
                            <Button onClick={submit} disabled={plants.create.isPending}>Salvar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {plants.plants.length === 0 ? (
                    <EmptyState icon={Building2} title="Nenhuma usina cadastrada" description="Crie uma usina antes de vincular unidades consumidoras, inversores e rateios." />
                ) : (
                    <Accordion type="multiple" className="space-y-3">
                        {plants.plants.map(plant => {
                            const plantUnits = units.consumerUnits.filter(unit => unit.plantId === plant.id);
                            const plantAllocations = allocations.allocations.filter(allocation => allocation.plantId === plant.id);
                            const plantInverters = inverters.filter(inverter => inverter.plantId === plant.id);

                            return (
                                <AccordionItem key={plant.id} value={plant.id} className="rounded-md border px-4">
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="grid flex-1 gap-3 text-left md:grid-cols-[1.5fr_1fr_1fr_1fr]">
                                            <div>
                                                <p className="font-medium">{plant.name || 'Usina sem nome'}</p>
                                                <p className="text-xs text-muted-foreground">{plant.providerPlantId || plant.id}</p>
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Provedor: </span>{plant.provider || '-'}
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Potência: </span>{toNumber(plant.installedPowerKw).toLocaleString('pt-BR')} kW
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                <Badge variant="secondary">{plantUnits.length} unidades</Badge>
                                                <Badge variant="outline">{plantAllocations.length} rateios</Badge>
                                                <Badge variant="outline">{plantInverters.length} inversores</Badge>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-6 pb-5">
                                        <div className="flex justify-end">
                                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => remove(plant)}>
                                                <Trash2 className="mr-2 h-4 w-4" />Remover usina
                                            </Button>
                                        </div>
                                        <PlantUnitsSection plant={plant} units={plantUnits} clientId={clientId} />
                                        <PlantAllocationsSection plant={plant} units={plantUnits} allocations={plantAllocations} clientId={clientId} />
                                        <PlantInvertersSection plant={plant} inverters={plantInverters} mutations={inverterMutations} />
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                )}
            </CardContent>
        </Card>
    );
}

function EnergyBillsTab({ clientId }: { clientId: string }) {
    const units = useAdminConsumerUnits(clientId);
    const bills = useAdminEnergyBills(clientId);
    const [open, setOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [consumerUnitId, setConsumerUnitId] = useState('');

    const importBill = async () => {
        if (!selectedFile || !consumerUnitId) return;
        try {
            await bills.importBill.mutateAsync({ file: selectedFile, consumerUnitId });
            toast.success('Fatura importada com sucesso');
            setOpen(false);
            setSelectedFile(null);
            setConsumerUnitId('');
        } catch (error: unknown) {
            toast.error(errorMessage(error, 'Erro ao importar fatura'));
        }
    };

    const markReviewed = async (bill: AdminEnergyBill) => {
        try {
            await bills.update.mutateAsync({ id: bill.id, data: { status: 'reviewed' } });
            toast.success('Fatura marcada como revisada');
        } catch (error: unknown) {
            toast.error(errorMessage(error, 'Erro ao atualizar fatura'));
        }
    };

    const remove = async (bill: AdminEnergyBill) => {
        if (!window.confirm(`Remover a fatura ${monthYear(bill)}?`)) return;
        try {
            await bills.remove.mutateAsync(bill.id);
            toast.success('Fatura removida');
        } catch (error: unknown) {
            toast.error(errorMessage(error, 'Erro ao remover fatura'));
        }
    };

    const billsByUnit = units.consumerUnits.map(unit => ({
        unit,
        bills: bills.bills
            .filter(bill => bill.consumerUnitId === unit.id)
            .sort((a, b) => (b.referenceYear * 100 + b.referenceMonth) - (a.referenceYear * 100 + a.referenceMonth)),
    }));

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Faturas de Energia</CardTitle>
                    <CardDescription>Importe PDFs para preencher o EnergyBill canônico e revisar os campos extraídos por IA.</CardDescription>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" disabled={units.consumerUnits.length === 0}><Upload className="mr-2 h-4 w-4" />Importar PDF</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Importar Fatura</DialogTitle>
                            <DialogDescription>O PDF será salvo no storage e analisado para criar ou atualizar a fatura do mês.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                            <SelectField label="Unidade Consumidora" value={consumerUnitId} onChange={setConsumerUnitId} options={units.consumerUnits.map(unit => ({ value: unit.id, label: unit.name || unit.clientNumber || unit.id }))} />
                            <div className="space-y-2">
                                <Label>Arquivo PDF</Label>
                                <Input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                                />
                                {selectedFile && <p className="text-sm text-muted-foreground">{selectedFile.name}</p>}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={importBill} disabled={!selectedFile || !consumerUnitId || bills.importBill.isPending}>
                                {bills.importBill.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Importar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {bills.bills.length === 0 ? (
                    <EmptyState icon={FileText} title="Nenhuma fatura importada" description="Importe a primeira fatura em PDF para alimentar histórico, economia e consumo." />
                ) : (
                    <Accordion type="multiple" className="space-y-3">
                        {billsByUnit.filter(group => group.bills.length > 0).map(({ unit, bills: unitBills }) => {
                            const latest = unitBills[0];
                            const totalRemaining = unitBills.reduce((sum, bill) => sum + remainingCredits(bill), 0);

                            return (
                                <AccordionItem key={unit.id} value={unit.id} className="rounded-md border px-4">
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="grid flex-1 gap-3 text-left md:grid-cols-[1.4fr_1fr_1fr_1fr]">
                                            <div>
                                                <p className="font-medium">{unit.name || unit.clientNumber || 'Unidade sem nome'}</p>
                                                <p className="text-xs text-muted-foreground">{unit.installationNumber || unit.id}</p>
                                            </div>
                                            <div className="text-sm"><span className="text-muted-foreground">Faturas: </span>{unitBills.length}</div>
                                            <div className="text-sm"><span className="text-muted-foreground">Última: </span>{monthYear(latest)}</div>
                                            <div className="text-sm"><span className="text-muted-foreground">Crédito restante: </span>{kwh(totalRemaining)}</div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-5">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Mês</TableHead>
                                                    <TableHead>Consumo</TableHead>
                                                    <TableHead>Injetado</TableHead>
                                                    <TableHead>Compensado</TableHead>
                                                    <TableHead>Restante</TableHead>
                                                    <TableHead>Total</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Pagamento</TableHead>
                                                    <TableHead className="text-right">Ações</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {unitBills.map(bill => (
                                                    <TableRow key={bill.id}>
                                                        <TableCell className="font-medium">{monthYear(bill)}</TableCell>
                                                        <TableCell>{kwh(bill.consumptionKwh ?? bill.billedConsumptionKwh)}</TableCell>
                                                        <TableCell>{kwh(bill.injectedEnergyKwh)}</TableCell>
                                                        <TableCell>{kwh(bill.compensatedEnergyKwh)}</TableCell>
                                                        <TableCell>{kwh(remainingCredits(bill))}</TableCell>
                                                        <TableCell>{currency(bill.totalBillValue ?? bill.totalAmount)}</TableCell>
                                                        <TableCell><Badge variant={bill.status === 'reviewed' ? 'default' : 'secondary'}>{bill.status || 'pendente'}</Badge></TableCell>
                                                        <TableCell><PaymentBadge bill={bill} /></TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-1">
                                                                {bill.billFileUrl && (
                                                                    <Button variant="ghost" size="sm" asChild>
                                                                        <a href={bill.billFileUrl} target="_blank" rel="noreferrer">PDF</a>
                                                                    </Button>
                                                                )}
                                                                {bill.status !== 'reviewed' && (
                                                                    <Button variant="outline" size="sm" onClick={() => markReviewed(bill)}>Revisada</Button>
                                                                )}
                                                                <BillPaymentDialog clientId={clientId} bill={bill} />
                                                                <Button variant="ghost" size="icon" onClick={() => remove(bill)}>
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                )}
            </CardContent>
        </Card>
    );
}

const PAYMENT_BADGE_VARIANT: Record<'success' | 'warning' | 'destructive', 'default' | 'secondary' | 'destructive'> = {
    success: 'default',
    warning: 'secondary',
    destructive: 'destructive',
};

function PaymentBadge({ bill }: { bill: AdminEnergyBill }) {
    const status = resolveBillStatus({
        paymentStatus: bill.paymentStatus ?? 'a_pagar',
        paidAt: bill.paidAt ?? null,
        dueDate: bill.dueDate ?? null,
    });
    const badge = statusToBadge(status);
    return <Badge variant={PAYMENT_BADGE_VARIANT[badge.tone]}>{badge.label}</Badge>;
}

function BillPaymentDialog({ clientId, bill }: { clientId: string; bill: AdminEnergyBill }) {
    const bills = useAdminEnergyBills(clientId);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        paymentStatus: (bill.paymentStatus ?? 'a_pagar') as 'a_pagar' | 'paga' | 'vencida',
        amountDue: bill.amountDue != null ? String(toNumber(bill.amountDue)) : '',
        dueDate: toDateInput(bill.dueDate),
        paidAt: toDateInput(bill.paidAt),
        pixCode: bill.pixCode ?? '',
        barcode: bill.barcode ?? '',
    });

    const persist = async (data: Partial<AdminEnergyBill>, successMessage: string) => {
        try {
            await bills.update.mutateAsync({ id: bill.id, data });
            toast.success(successMessage);
            setOpen(false);
        } catch (error: unknown) {
            toast.error(errorMessage(error, 'Erro ao atualizar pagamento'));
        }
    };

    const save = () =>
        persist(
            {
                paymentStatus: form.paymentStatus,
                amountDue: form.amountDue ? Number(form.amountDue) : null,
                dueDate: form.dueDate || null,
                paidAt: form.paidAt || null,
                pixCode: form.pixCode || null,
                barcode: form.barcode || null,
            } as Partial<AdminEnergyBill>,
            'Pagamento atualizado'
        );

    const markPaid = () =>
        persist(
            { paymentStatus: 'paga', paidAt: new Date().toISOString().slice(0, 10) } as Partial<AdminEnergyBill>,
            'Fatura marcada como paga'
        );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm"><BadgeDollarSign className="mr-1 h-4 w-4" />Pagamento</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Pagamento da fatura {monthYear(bill)}</DialogTitle>
                    <DialogDescription>Gerencie status, vencimento, valor e o código PIX exibido ao pagador.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 sm:grid-cols-2">
                    <SelectField
                        label="Status"
                        value={form.paymentStatus}
                        onChange={value => setForm(prev => ({ ...prev, paymentStatus: value as 'a_pagar' | 'paga' | 'vencida' }))}
                        options={[
                            { value: 'a_pagar', label: 'A pagar' },
                            { value: 'paga', label: 'Paga' },
                            { value: 'vencida', label: 'Vencida' },
                        ]}
                    />
                    <Field label="Valor (R$)" type="number" value={form.amountDue} onChange={value => setForm(prev => ({ ...prev, amountDue: value }))} />
                    <Field label="Vencimento" type="date" value={form.dueDate} onChange={value => setForm(prev => ({ ...prev, dueDate: value }))} />
                    <Field label="Pago em" type="date" value={form.paidAt} onChange={value => setForm(prev => ({ ...prev, paidAt: value }))} />
                    <Field label="Código PIX" value={form.pixCode} onChange={value => setForm(prev => ({ ...prev, pixCode: value }))} />
                    <Field label="Código de barras" value={form.barcode} onChange={value => setForm(prev => ({ ...prev, barcode: value }))} />
                </div>
                <DialogFooter className="gap-2 sm:justify-between">
                    <Button variant="secondary" onClick={markPaid} disabled={bills.update.isPending}>Marcar como paga</Button>
                    <Button onClick={save} disabled={bills.update.isPending}>
                        {bills.update.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function Field({
    label,
    value,
    onChange,
    type = 'text',
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
}) {
    return (
        <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
            <Input type={type} value={value} placeholder={placeholder} onChange={event => onChange(event.target.value)} />
        </div>
    );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="space-y-3 rounded-md border bg-muted/20 p-4">
            <h4 className="text-sm font-medium">{title}</h4>
            <div className="grid gap-4 sm:grid-cols-2">{children}</div>
        </div>
    );
}

function SwitchField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
    return (
        <div className="flex min-h-10 items-center justify-between rounded-md border bg-background px-3">
            <Label className="text-sm">{label}</Label>
            <Switch checked={checked} onCheckedChange={onChange} />
        </div>
    );
}

function SearchSelectField({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
}) {
    const [open, setOpen] = useState(false);
    const selected = options.find(option => option.value === value);

    return (
        <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between font-normal">
                        <span className="truncate">{selected?.label || 'Selecione'}</span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Buscar..." />
                        <CommandList>
                            <CommandEmpty>Nenhum resultado.</CommandEmpty>
                            <CommandGroup>
                                {options.map(option => (
                                    <CommandItem
                                        key={option.value}
                                        value={`${option.label} ${option.value}`}
                                        onSelect={() => {
                                            onChange(option.value);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check className={cn('mr-2 h-4 w-4', value === option.value ? 'opacity-100' : 'opacity-0')} />
                                        <span className="truncate">{option.label}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}

const SelectField = SearchSelectField;
