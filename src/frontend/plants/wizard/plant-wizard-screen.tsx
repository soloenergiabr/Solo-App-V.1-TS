'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import { PageLayout, PageHeader, PageEmpty } from '@/components/ui/page-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Zap, Home, Bluetooth, Sun, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/* ─── Types ─── */

interface PlantFormData {
    name: string;
    installedPowerKw: string;
    address: string;
    city: string;
    state: string;
}

interface InverterFormData {
    provider: string;
    providerId: string;
}

interface ConsumerUnitFormData {
    name: string;
    clientNumber: string;
    distributor: string;
}

/* ─── Steps ─── */

type Step = 'plant' | 'inverter' | 'consumer-units' | 'review';

const STEPS: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: 'plant', label: 'Dados da Usina', icon: <Home className="w-4 h-4" /> },
    { key: 'inverter', label: 'Inversor', icon: <Bluetooth className="w-4 h-4" /> },
    { key: 'consumer-units', label: 'Unidades Consumidoras', icon: <Sun className="w-4 h-4" /> },
    { key: 'review', label: 'Revisao', icon: <CheckCircle2 className="w-4 h-4" /> },
];

/* ─── Helpers ─── */

const STEP_ORDER: Step[] = ['plant', 'inverter', 'consumer-units', 'review'];
const STEP_INDEX = (s: Step) => STEP_ORDER.indexOf(s);

/* ─── Component ─── */

export function PlantWizardScreen() {
    const router = useRouter();
    const api = useAuthenticatedApi();

    const [currentStep, setCurrentStep] = useState<Step>('plant');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoadingExisting, setIsLoadingExisting] = useState(false);

    // Form data per step
    const [plantData, setPlantData] = useState<PlantFormData>({
        name: '',
        installedPowerKw: '',
        address: '',
        city: '',
        state: '',
    });
    const [inverterData, setInverterData] = useState<InverterFormData>({
        provider: '',
        providerId: '',
    });
    const [consumerUnits, setConsumerUnits] = useState<ConsumerUnitFormData[]>([
        { name: '', clientNumber: '', distributor: '' },
    ]);

    // Existing plants (for Step 4 review and awareness)
    const [existingPlants, setExistingPlants] = useState<any[]>([]);

    /* ─── Load existing plants on mount ─── */

    useEffect(() => {
        const loadExisting = async () => {
            setIsLoadingExisting(true);
            try {
                const res = await api.get('/client/plants');
                if (res.data?.success) {
                    setExistingPlants(res.data.data || []);
                }
            } catch {
                // Non-critical; wizard can still proceed
            } finally {
                setIsLoadingExisting(false);
            }
        };
        loadExisting();
    }, []);

    /* ─── Navigation ─── */

    const goNext = useCallback(() => {
        const idx = STEP_INDEX(currentStep);
        if (idx < STEP_ORDER.length - 1) {
            setError(null);
            setCurrentStep(STEP_ORDER[idx + 1]);
        }
    }, [currentStep]);

    const goBack = useCallback(() => {
        const idx = STEP_INDEX(currentStep);
        if (idx > 0) {
            setError(null);
            setCurrentStep(STEP_ORDER[idx - 1]);
        }
    }, [currentStep]);

    /* ─── Validation ─── */

    const canGoNext = useCallback((): boolean => {
        switch (currentStep) {
            case 'plant':
                return plantData.name.trim().length > 0;
            case 'inverter':
                return true; // optional
            case 'consumer-units':
                return consumerUnits.some((u) => u.name.trim().length > 0);
            case 'review':
                return true;
        }
    }, [currentStep, plantData, consumerUnits]);

    /* ─── Submit ─── */

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            // 1. Create plant
            const plantPayload: Record<string, any> = { name: plantData.name };
            if (plantData.installedPowerKw) plantPayload.installedPowerKw = Number(plantData.installedPowerKw);
            if (plantData.address) plantPayload.address = plantData.address;
            if (plantData.city) plantPayload.city = plantData.city;
            if (plantData.state) plantPayload.state = plantData.state;

            const plantRes = await api.post('/client/plants', plantPayload);
            if (!plantRes.data?.success) throw new Error(plantRes.data?.message || 'Erro ao criar usina');
            const plantId: string = plantRes.data.data.id;

            // 2. Create inverter (if provider is provided)
            if (inverterData.provider || inverterData.providerId) {
                await api.post('/client/inverters', {
                    plantId,
                    provider: inverterData.provider || undefined,
                    providerId: inverterData.providerId || undefined,
                });
            }

            // 3. Create consumer units (at least the ones with a name)
            const validUnits = consumerUnits.filter((u) => u.name.trim().length > 0);
            for (const unit of validUnits) {
                const unitPayload: Record<string, any> = { plantId, name: unit.name };
                if (unit.clientNumber) unitPayload.clientNumber = unit.clientNumber;
                if (unit.distributor) unitPayload.distributor = unit.distributor;
                await api.post('/client/consumer-units', unitPayload);
            }

            toast.success('Usina cadastrada com sucesso!');
            router.push('/dashboard');
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                'Erro ao cadastrar usina. Tente novamente.';
            setError(msg);
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ─── Consumer unit handlers ─── */

    const addConsumerUnit = () => {
        setConsumerUnits((prev) => [...prev, { name: '', clientNumber: '', distributor: '' }]);
    };

    const removeConsumerUnit = (index: number) => {
        setConsumerUnits((prev) => prev.filter((_, i) => i !== index));
    };

    const updateConsumerUnit = (index: number, field: keyof ConsumerUnitFormData, value: string) => {
        setConsumerUnits((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    /* ─── Step renders ─── */

    const renderPlantStep = () => (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Dados da Usina</CardTitle>
                    <CardDescription>Informe os dados basicos da sua usina solar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="plant-name">Nome da Usina *</Label>
                        <Input
                            id="plant-name"
                            placeholder="Ex: Minha Usina"
                            value={plantData.name}
                            onChange={(e) => setPlantData((p) => ({ ...p, name: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="plant-power">Potencia Instalada (kW)</Label>
                        <Input
                            id="plant-power"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Ex: 5.0"
                            value={plantData.installedPowerKw}
                            onChange={(e) => setPlantData((p) => ({ ...p, installedPowerKw: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="plant-address">Endereco</Label>
                        <Input
                            id="plant-address"
                            placeholder="Rua, numero, bairro"
                            value={plantData.address}
                            onChange={(e) => setPlantData((p) => ({ ...p, address: e.target.value }))}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="plant-city">Cidade</Label>
                            <Input
                                id="plant-city"
                                placeholder="Sao Paulo"
                                value={plantData.city}
                                onChange={(e) => setPlantData((p) => ({ ...p, city: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="plant-state">Estado</Label>
                            <Input
                                id="plant-state"
                                placeholder="SP"
                                value={plantData.state}
                                onChange={(e) => setPlantData((p) => ({ ...p, state: e.target.value }))}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderInverterStep = () => (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Conexao do Inversor</CardTitle>
                    <CardDescription>
                        Informe os dados do inversor. Este passo e opcional.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="inv-provider">Fabricante / Provedor</Label>
                        <Input
                            id="inv-provider"
                            placeholder="Ex: Solis, Growatt, Huawei"
                            value={inverterData.provider}
                            onChange={(e) => setInverterData((p) => ({ ...p, provider: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="inv-provider-id">ID do Inversor / Serial</Label>
                        <Input
                            id="inv-provider-id"
                            placeholder="Ex: serial number ou codigo"
                            value={inverterData.providerId}
                            onChange={(e) => setInverterData((p) => ({ ...p, providerId: e.target.value }))}
                        />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Se voce nao tem esses dados agora, pode pular esta etapa.
                    </p>
                </CardContent>
            </Card>
        </div>
    );

    const renderConsumerUnitsStep = () => (
        <div className="space-y-4">
            {consumerUnits.map((unit, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Unidade Consumidora {index + 1}</CardTitle>
                            <CardDescription>
                                Dados da unidade consumidora ligada a esta usina.
                            </CardDescription>
                        </div>
                        {consumerUnits.length > 1 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeConsumerUnit(index)}
                                className="text-destructive hover:text-destructive"
                            >
                                Remover
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor={`cu-name-${index}`}>Nome *</Label>
                            <Input
                                id={`cu-name-${index}`}
                                placeholder="Ex: Casa, Loja"
                                value={unit.name}
                                onChange={(e) => updateConsumerUnit(index, 'name', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`cu-number-${index}`}>Numero do Cliente</Label>
                            <Input
                                id={`cu-number-${index}`}
                                placeholder="Codigo na conta de energia"
                                value={unit.clientNumber}
                                onChange={(e) => updateConsumerUnit(index, 'clientNumber', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`cu-dist-${index}`}>Distribuidora</Label>
                            <Input
                                id={`cu-dist-${index}`}
                                placeholder="Ex: Enel, CPFL"
                                value={unit.distributor}
                                onChange={(e) => updateConsumerUnit(index, 'distributor', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>
            ))}
            <Button variant="outline" onClick={addConsumerUnit} className="w-full">
                + Adicionar outra unidade consumidora
            </Button>
        </div>
    );

    const renderReviewStep = () => (
        <div className="space-y-4">
            {/* Plant summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Usina</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Nome:</span>
                        <span className="font-medium">{plantData.name || '---'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Potencia:</span>
                        <span>{plantData.installedPowerKw ? `${plantData.installedPowerKw} kW` : '---'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Endereco:</span>
                        <span>{plantData.address || '---'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Cidade/Estado:</span>
                        <span>{plantData.city || '---'}{plantData.state ? ` / ${plantData.state}` : ''}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Inverter summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Inversor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Fabricante:</span>
                        <span>{inverterData.provider || 'Nao informado'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">ID / Serial:</span>
                        <span>{inverterData.providerId || 'Nao informado'}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Consumer units summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Unidades Consumidoras</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    {consumerUnits.filter((u) => u.name.trim()).length === 0 ? (
                        <p className="text-muted-foreground">Nenhuma unidade cadastrada.</p>
                    ) : (
                        consumerUnits
                            .filter((u) => u.name.trim())
                            .map((unit, i) => (
                                <div key={i} className="border-b pb-2 last:border-b-0 last:pb-0">
                                    <div className="flex justify-between">
                                        <span className="font-medium">{unit.name}</span>
                                        <span className="text-muted-foreground">{unit.distributor || '---'}</span>
                                    </div>
                                    {unit.clientNumber && (
                                        <p className="text-muted-foreground">Cliente: {unit.clientNumber}</p>
                                    )}
                                </div>
                            ))
                    )}
                </CardContent>
            </Card>

            {/* Existing plants alert */}
            {existingPlants.length > 0 && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Voce ja possui {existingPlants.length} usina(s)</AlertTitle>
                    <AlertDescription>
                        Esta nova usina sera adicionada as suas existentes.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );

    /* ─── Main Render ─── */

    if (isLoadingExisting) {
        return (
            <PageLayout
                header={<PageHeader title="Cadastrar Nova Usina" subtitle="Configure sua usina solar" />}
            >
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </PageLayout>
        );
    }

    const stepContent = () => {
        switch (currentStep) {
            case 'plant':
                return renderPlantStep();
            case 'inverter':
                return renderInverterStep();
            case 'consumer-units':
                return renderConsumerUnitsStep();
            case 'review':
                return renderReviewStep();
        }
    };

    return (
        <PageLayout
            header={
                <PageHeader title="Cadastrar Nova Usina" subtitle="Configure sua usina solar passo a passo" />
            }
        >
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                {STEPS.map((step, i) => {
                    const isActive = STEP_INDEX(currentStep) === i;
                    const isPast = STEP_INDEX(currentStep) > i;
                    return (
                        <div key={step.key} className="flex items-center gap-2 min-w-0">
                            <div
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                                    isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : isPast
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-muted text-muted-foreground'
                                }`}
                            >
                                {step.icon}
                                <span>{step.label}</span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className="h-px w-4 bg-border hidden sm:block" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Error alert */}
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Step content */}
            <div className="flex-1">{stepContent()}</div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <Button
                    variant="outline"
                    onClick={goBack}
                    disabled={STEP_INDEX(currentStep) === 0 || isSubmitting}
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Voltar
                </Button>

                {currentStep === 'review' ? (
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Confirmar
                            </>
                        )}
                    </Button>
                ) : (
                    <Button onClick={goNext} disabled={!canGoNext()}>
                        Proximo
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                )}
            </div>
        </PageLayout>
    );
}
