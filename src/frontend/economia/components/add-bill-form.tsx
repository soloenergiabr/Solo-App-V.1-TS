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
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';


const PAYMENT_STATUSES = [
    { value: 'a_pagar', label: 'A Pagar' },
    { value: 'paga', label: 'Paga' },
    { value: 'vencida', label: 'Vencida' },
];

const billFormSchema = z.object({
    plantId: z.string().min(1, 'Selecione uma usina'),
    consumerUnitId: z.string().min(1, 'ID da unidade consumidora é obrigatório'),
    competenceDate: z.string().min(1, 'Mês de referência é obrigatório'),
    referenceMonth: z.coerce.number().int().min(1).max(12),
    referenceYear: z.coerce.number().int().min(2020, 'Ano inválido'),
    monitoredGenerationKwh: z.coerce.number().min(0).optional().default(0),
    consumptionKwh: z.coerce.number().min(0).optional().default(0),
    injectedEnergyKwh: z.coerce.number().min(0).optional().default(0),
    tariffPerKwh: z.coerce.number().min(0).optional().default(0),
    totalBillValue: z.coerce.number().min(0).optional().default(0),
    estimatedSavings: z.coerce.number().optional().default(0),
    paymentStatus: z.enum(['a_pagar', 'paga', 'vencida']).optional().default('a_pagar'),
});

type BillFormValues = z.infer<typeof billFormSchema>;

interface PlantOption {
    id: string;
    name: string;
}

export function AddBillForm() {
    const [open, setOpen] = useState(false);
    const [plants, setPlants] = useState<PlantOption[]>([]);
    const [loadingPlants, setLoadingPlants] = useState(false);
    const api = useAuthenticatedApi();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentYear = new Date().getFullYear();

    const form = useForm<BillFormValues>({
        resolver: zodResolver(billFormSchema) as any,
        defaultValues: {
            plantId: '',
            consumerUnitId: '',
            competenceDate: new Date().toISOString().substring(0, 7),
            referenceMonth: new Date().getMonth() + 1,
            referenceYear: currentYear,
            monitoredGenerationKwh: 0,
            consumptionKwh: 0,
            injectedEnergyKwh: 0,
            tariffPerKwh: 0,
            totalBillValue: 0,
            estimatedSavings: 0,
            paymentStatus: 'a_pagar',
        },
    });

    // Watch competenceDate to auto-fill referenceMonth/referenceYear
    const watchedCompetenceDate = form.watch('competenceDate');

    useEffect(() => {
        if (watchedCompetenceDate) {
            const [year, month] = watchedCompetenceDate.split('-').map(Number);
            if (year && month) {
                form.setValue('referenceYear', year);
                form.setValue('referenceMonth', month);
            }
        }
    }, [watchedCompetenceDate, form]);

    // Fetch client plants on mount
    useEffect(() => {
        if (!api.isAuthenticated || !open) return;
        setLoadingPlants(true);
        api.get('/client/plants')
            .then((res) => {
                if (res.data.success) {
                    setPlants(res.data.data.map((p: any) => ({ id: p.id, name: p.name })));
                }
            })
            .catch(() => toast.error('Erro ao carregar usinas'))
            .finally(() => setLoadingPlants(false));
    }, [api.isAuthenticated, open]);

    const onSubmit = async (data: BillFormValues) => {
        setIsSubmitting(true);
        try {
            const fullDate = new Date(`${data.competenceDate}-01T12:00:00Z`).toISOString();
            const response = await api.post('/client/energy-bills', {
                ...data,
                competenceDate: fullDate,
            });

            if (response.data.success) {
                toast.success('Fatura enviada para revisão com sucesso!');
                setOpen(false);
                form.reset();
            } else {
                toast.error(response.data.message || 'Erro ao enviar fatura');
            }
        } catch (error: any) {
            console.error('Error submitting bill:', error);
            toast.error(error.response?.data?.message || 'Erro ao enviar fatura');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Fatura
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Adicionar Fatura</DialogTitle>
                    <DialogDescription>
                        Preencha os dados da fatura de energia. A fatura será enviada para revisão.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Plant / UC row */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="plantId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Usina</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                disabled={loadingPlants}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {plants.map((p) => (
                                                        <SelectItem key={p.id} value={p.id}>
                                                            {p.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="consumerUnitId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ID da UC</FormLabel>
                                        <FormControl>
                                            <Input placeholder="ID da unidade consumidora" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Month / Year row */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="competenceDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mês de Referência</FormLabel>
                                        <FormControl>
                                            <Input type="month" {...field} />
                                        </FormControl>
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
                                        <FormControl>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PAYMENT_STATUSES.map((s) => (
                                                        <SelectItem key={s.value} value={s.value}>
                                                            {s.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Energy data row */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="consumptionKwh"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Consumo (kWh)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="injectedEnergyKwh"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Energia Injetada (kWh)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
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
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="tariffPerKwh"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tarifa (R$/kWh)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.00001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Financial data row */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="totalBillValue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor Total (R$)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="estimatedSavings"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Economia Estimada (R$)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Enviar para Revisão
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
