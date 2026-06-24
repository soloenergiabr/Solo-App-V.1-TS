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

const MONTHS = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
];

const generationFormSchema = z.object({
    plantId: z.string().min(1, 'Selecione uma usina'),
    referenceMonth: z.coerce.number().int().min(1).max(12),
    referenceYear: z.coerce.number().int().min(2000, 'Ano inválido').max(2100, 'Ano inválido'),
    energyKwh: z.coerce.number().min(0, 'A geração deve ser maior ou igual a 0'),
});

type GenerationFormValues = z.infer<typeof generationFormSchema>;

interface PlantOption {
    id: string;
    name: string;
}

export function AddGenerationForm() {
    const [open, setOpen] = useState(false);
    const [plants, setPlants] = useState<PlantOption[]>([]);
    const [loadingPlants, setLoadingPlants] = useState(false);
    const api = useAuthenticatedApi();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentYear = new Date().getFullYear();

    const form = useForm<GenerationFormValues>({
        resolver: zodResolver(generationFormSchema) as any,
        defaultValues: {
            plantId: '',
            referenceMonth: new Date().getMonth() + 1,
            referenceYear: currentYear,
            energyKwh: 0,
        },
    });

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

    const onSubmit = async (data: GenerationFormValues) => {
        setIsSubmitting(true);
        try {
            const response = await api.post('/client/generation', {
                plantId: data.plantId,
                referenceMonth: data.referenceMonth,
                referenceYear: data.referenceYear,
                energyKwh: data.energyKwh,
            });

            if (response.data.success) {
                toast.success('Geração registrada para revisão!');
                setOpen(false);
                form.reset();
            } else {
                toast.error(response.data.message || 'Erro ao registrar geração');
            }
        } catch (error: any) {
            console.error('Error submitting generation:', error);
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
                    Adicionar Geração
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Adicionar geração manual</DialogTitle>
                    <DialogDescription>
                        Preencha os dados de geração de energia. A geração será enviada para revisão.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Plant */}
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

                        {/* Month / Year row */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="referenceMonth"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mês</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={String(field.value)}
                                                onValueChange={(v) => field.onChange(Number(v))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {MONTHS.map((m) => (
                                                        <SelectItem key={m.value} value={String(m.value)}>
                                                            {m.label}
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
                                name="referenceYear"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ano</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={2000}
                                                max={2100}
                                                placeholder="2026"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Energy */}
                        <FormField
                            control={form.control}
                            name="energyKwh"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Geração (kWh)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" min={0} placeholder="0" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
