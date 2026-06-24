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

const generationSchema = z.object({
    plantId: z.string().min(1, 'Usina é obrigatória'),
    referenceMonth: z.coerce.number().min(1, 'Mês inválido').max(12, 'Mês inválido'),
    referenceYear: z.coerce.number().min(2020, 'Ano inválido').max(2100, 'Ano inválido'),
    energyKwh: z.coerce.number().min(0, 'Geração deve ser positiva'),
});

type GenerationFormValues = z.infer<typeof generationSchema>;

interface PlantOption {
    id: string;
    name?: string | null;
}

interface AddGenerationDialogProps {
    clientId: string;
    onSuccess: () => void;
}

export function AddGenerationDialog({ clientId, onSuccess }: AddGenerationDialogProps) {
    const [open, setOpen] = useState(false);
    const api = useAuthenticatedApi();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [plants, setPlants] = useState<PlantOption[]>([]);
    const [plantsLoading, setPlantsLoading] = useState(false);

    const currentYear = new Date().getFullYear();

    const form = useForm<GenerationFormValues>({
        resolver: zodResolver(generationSchema) as any,
        defaultValues: {
            plantId: '',
            referenceMonth: new Date().getMonth() + 1,
            referenceYear: currentYear,
            energyKwh: 0,
        },
    });

    useEffect(() => {
        if (open) {
            setPlantsLoading(true);
            api.get<{ success: boolean; data: PlantOption[] }>(`/admin/clients/${clientId}/plants`)
                .then(response => {
                    setPlants(response.data.data || []);
                })
                .catch(() => {
                    toast.error('Erro ao carregar usinas');
                })
                .finally(() => {
                    setPlantsLoading(false);
                });
        }
    }, [open, clientId, api]);

    const onSubmit = async (data: GenerationFormValues) => {
        setIsSubmitting(true);
        try {
            const response = await api.post(`/admin/clients/${clientId}/generation`, {
                plantId: data.plantId,
                referenceMonth: data.referenceMonth,
                referenceYear: data.referenceYear,
                energyKwh: data.energyKwh,
            });

            if (response.data.success) {
                toast.success('Geração registrada com sucesso');
                setOpen(false);
                form.reset();
                onSuccess();
            } else {
                toast.error(response.data.message || 'Erro ao registrar geração');
            }
        } catch (error: any) {
            console.error('Error registering generation:', error);
            toast.error(error.response?.data?.message || 'Erro ao registrar geração');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar geração
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Adicionar geração manual</DialogTitle>
                    <DialogDescription>
                        Insira os dados de geração para o mês de referência específico.
                    </DialogDescription>
                </DialogHeader>
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
                                        disabled={plantsLoading}
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
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="referenceMonth"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mês de referência</FormLabel>
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
                        <FormField
                            control={form.control}
                            name="energyKwh"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Geração (kWh)</FormLabel>
                                    <FormControl>
                                        <Input type="number" min={0} step="0.01" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
