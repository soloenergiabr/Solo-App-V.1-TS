'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';

const billSchema = z.object({
    plantId: z.string().min(1, 'Usina é obrigatória'),
    consumerUnitId: z.string().min(1, 'Unidade consumidora é obrigatória'),
    referenceMonth: z.coerce.number().min(1, 'Mês inválido').max(12, 'Mês inválido'),
    referenceYear: z.coerce.number().min(2020, 'Ano inválido').max(2100, 'Ano inválido'),
    monitoredGenerationKwh: z.coerce.number().min(0, 'Geração monitorada deve ser positiva'),
    consumptionKwh: z.coerce.number().min(0, 'Consumo deve ser positivo'),
    tariffPerKwh: z.coerce.number().min(0, 'Tarifa deve ser positiva'),
    totalBillValue: z.coerce.number().min(0, 'Valor total deve ser positivo'),
    estimatedSavings: z.coerce.number().min(0, 'Economia estimada deve ser positiva').optional(),
    paymentStatus: z.enum(['a_pagar', 'paga', 'vencida']),
});

type BillFormValues = z.infer<typeof billSchema>;

interface PlantOption {
    id: string;
    name?: string | null;
}

interface ConsumerUnitOption {
    id: string;
    plantId: string;
    name?: string | null;
    clientNumber?: string | null;
}

interface AddBillDialogProps {
    clientId: string;
    onSuccess: () => void;
}

export function AddBillDialog({ clientId, onSuccess }: AddBillDialogProps) {
    const [open, setOpen] = useState(false);
    const api = useAuthenticatedApi();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [plants, setPlants] = useState<PlantOption[]>([]);
    const [plantsLoading, setPlantsLoading] = useState(false);
    const [plantsError, setPlantsError] = useState<string | null>(null);
    const [consumerUnits, setConsumerUnits] = useState<ConsumerUnitOption[]>([]);
    const [consumerUnitsLoading, setConsumerUnitsLoading] = useState(false);
    const [consumerUnitsError, setConsumerUnitsError] = useState<string | null>(null);

    const currentYear = new Date().getFullYear();

    const form = useForm<BillFormValues>({
        resolver: zodResolver(billSchema) as any,
        defaultValues: {
            plantId: '',
            consumerUnitId: '',
            referenceMonth: new Date().getMonth() + 1,
            referenceYear: currentYear,
            monitoredGenerationKwh: 0,
            consumptionKwh: 0,
            tariffPerKwh: 0,
            totalBillValue: 0,
            estimatedSavings: undefined,
            paymentStatus: 'a_pagar',
        },
    });

    const selectedPlantId = form.watch('plantId');

    // Reset consumerUnitId when plant changes
    useEffect(() => {
        if (selectedPlantId) {
            form.setValue('consumerUnitId', '');
        }
    }, [selectedPlantId, form]);

    useEffect(() => {
        if (open) {
            setPlantsLoading(true);
            setPlantsError(null);
            setConsumerUnitsLoading(true);
            setConsumerUnitsError(null);

            api.get<{ success: boolean; data: PlantOption[] }>(`/admin/clients/${clientId}/plants`)
                .then(response => {
                    setPlants(response.data.data || []);
                })
                .catch(() => {
                    setPlantsError('Erro ao carregar usinas');
                    toast.error('Erro ao carregar usinas');
                })
                .finally(() => {
                    setPlantsLoading(false);
                });

            api.get<{ success: boolean; data: ConsumerUnitOption[] }>(`/admin/clients/${clientId}/consumer-units`)
                .then(response => {
                    setConsumerUnits(response.data.data || []);
                })
                .catch(() => {
                    setConsumerUnitsError('Erro ao carregar unidades consumidoras');
                    toast.error('Erro ao carregar unidades consumidoras');
                })
                .finally(() => {
                    setConsumerUnitsLoading(false);
                });
        }
    }, [open, clientId, api]);

    const filteredConsumerUnits = consumerUnits.filter(unit => unit.plantId === selectedPlantId);

    const onSubmit = async (data: BillFormValues) => {
        setIsSubmitting(true);
        try {
            const competenceDate = new Date(Date.UTC(data.referenceYear, data.referenceMonth - 1, 1)).toISOString();

            const payload: Record<string, unknown> = {
                plantId: data.plantId,
                consumerUnitId: data.consumerUnitId,
                referenceMonth: data.referenceMonth,
                referenceYear: data.referenceYear,
                competenceDate,
                monitoredGenerationKwh: data.monitoredGenerationKwh,
                consumptionKwh: data.consumptionKwh,
                tariffPerKwh: data.tariffPerKwh,
                totalBillValue: data.totalBillValue,
                paymentStatus: data.paymentStatus,
            };

            if (data.estimatedSavings !== undefined && data.estimatedSavings !== null) {
                payload.estimatedSavings = data.estimatedSavings;
            }

            const response = await api.post(`/admin/clients/${clientId}/energy-bills`, payload);

            if (response.data.success) {
                toast.success('Fatura salva com sucesso');
                setOpen(false);
                form.reset();
                onSuccess();
            } else {
                toast.error(response.data.message || 'Erro ao salvar fatura');
            }
        } catch (error: any) {
            console.error('Error saving bill:', error);
            toast.error(error.response?.data?.message || 'Erro ao salvar fatura');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isDataLoading = plantsLoading || consumerUnitsLoading;
    const hasDataError = plantsError || consumerUnitsError;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar fatura
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Adicionar fatura manual</DialogTitle>
                    <DialogDescription>
                        Insira os dados da fatura de energia para o mês de referência específico.
                    </DialogDescription>
                </DialogHeader>
                {hasDataError ? (
                    <Alert variant="destructive">
                        <AlertTitle>Erro ao carregar dados</AlertTitle>
                        <AlertDescription>{plantsError || consumerUnitsError}</AlertDescription>
                    </Alert>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="plantId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Usina</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={isDataLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={plantsLoading ? 'Carregando usinas...' : 'Selecione uma usina'} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {plants.map(plant => (
                                                    <SelectItem key={plant.id} value={plant.id}>
                                                        {plant.name || plant.id}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="consumerUnitId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unidade Consumidora</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={!selectedPlantId || isDataLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue
                                                        placeholder={
                                                            consumerUnitsLoading
                                                                ? 'Carregando unidades...'
                                                                : !selectedPlantId
                                                                    ? 'Selecione uma usina primeiro'
                                                                    : 'Selecione uma unidade consumidora'
                                                        }
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {filteredConsumerUnits.map(unit => (
                                                    <SelectItem key={unit.id} value={unit.id}>
                                                        {unit.name || unit.clientNumber || unit.id}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="referenceMonth"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mês de Referência</FormLabel>
                                            <Select
                                                onValueChange={value => field.onChange(Number(value))}
                                                value={String(field.value)}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Mês" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                                        <SelectItem key={month} value={String(month)}>
                                                            {String(month).padStart(2, '0')}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="referenceYear"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ano</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={2020} max={2100} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="monitoredGenerationKwh"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Geração Monitorada (kWh)</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={0} step="0.01" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="consumptionKwh"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Consumo da Rede (kWh)</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={0} step="0.01" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="tariffPerKwh"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tarifa (R$/kWh)</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={0} step="0.00001" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="totalBillValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Valor Total Fatura (R$)</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={0} step="0.01" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="estimatedSavings"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Economia Estimada (R$)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    step="0.01"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={event => {
                                                        const val = event.target.value;
                                                        field.onChange(val === '' ? undefined : Number(val));
                                                    }}
                                                />
                                            </FormControl>
                                            <p className="text-xs text-muted-foreground">
                                                Deixe em branco para calcular automaticamente.
                                            </p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="paymentStatus"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status Pagamento</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="a_pagar">A pagar</SelectItem>
                                                    <SelectItem value="paga">Paga</SelectItem>
                                                    <SelectItem value="vencida">Vencida</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isSubmitting || isDataLoading}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Salvar
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}
