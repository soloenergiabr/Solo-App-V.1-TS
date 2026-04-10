'use client';

import { useState } from 'react';
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
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';

const consumptionSchema = z.object({
    competenceDate: z.string().min(1, 'Mês de Referência é obrigatório'),
    consumptionKwh: z.coerce.number().min(0, 'Consumo deve ser positivo'),
    injectedEnergyKwh: z.coerce.number().min(0, 'Energia injetada deve ser positiva'),
    tariffPerKwh: z.coerce.number().min(0, 'Tarifa deve ser positiva'),
    totalBillValue: z.coerce.number().min(0, 'Valor total deve ser positivo')
});

type ConsumptionFormValues = z.infer<typeof consumptionSchema>;

interface AddConsumptionDialogProps {
    clientId: string;
    onSuccess: () => void;
}

export function AddConsumptionDialog({ clientId, onSuccess }: AddConsumptionDialogProps) {
    const [open, setOpen] = useState(false);
    const api = useAuthenticatedApi();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ConsumptionFormValues>({
        resolver: zodResolver(consumptionSchema) as any,
        defaultValues: {
            competenceDate: new Date().toISOString().substring(0, 7), // YYYY-MM
            consumptionKwh: 0,
            injectedEnergyKwh: 0,
            tariffPerKwh: 0,
            totalBillValue: 0,
        },
    });

    const onSubmit = async (data: ConsumptionFormValues) => {
        setIsSubmitting(true);
        try {
            // Convert YYYY-MM to full ISO date
            const fullDate = new Date(`${data.competenceDate}-01T12:00:00Z`).toISOString();
            
            const response = await api.post(`/admin/clients/${clientId}/consumption`, {
                ...data,
                competenceDate: fullDate
            });

            if (response.data.success) {
                toast.success('Consumo registrado com sucesso!');
                setOpen(false);
                form.reset();
                onSuccess();
            } else {
                toast.error(response.data.message || 'Erro ao registrar consumo');
            }
        } catch (error: any) {
            console.error('Error registering consumption:', error);
            toast.error(error.response?.data?.message || 'Erro ao registrar consumo');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Manualmente
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Adicionar Consumo Manual</DialogTitle>
                    <DialogDescription>
                        Insira os dados da fatura para o mês de referência específico.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="consumptionKwh"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Consumo da Rede (kWh)</FormLabel>
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
                            <FormField
                                control={form.control}
                                name="totalBillValue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor Total Fatura (R$)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Salvar
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
