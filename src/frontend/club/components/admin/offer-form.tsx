'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { OfferModel } from '@/backend/club/models/offer.model';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const offerSchema = z.object({
    title: z.string().min(1, 'Título é obrigatório'),
    description: z.string().min(1, 'Descrição é obrigatória'),
    partner: z.string().min(1, 'Parceiro é obrigatório'),
    cost: z.coerce.number().min(0, 'Custo deve ser maior ou igual a 0'),
    discount: z.string().optional(),
    imageUrl: z.string().optional(),
    validFrom: z.string().optional(),
    validTo: z.string().optional(),
    isActive: z.boolean().default(true),
});

type OfferFormValues = z.infer<typeof offerSchema>;

interface OfferFormProps {
    offer?: OfferModel;
    onSuccess: () => void;
    onCancel: () => void;
}

export function OfferForm({ offer, onSuccess, onCancel }: OfferFormProps) {
    const api = useAuthenticatedApi();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<OfferFormValues>({
        resolver: zodResolver(offerSchema),
        defaultValues: {
            title: offer?.title || '',
            description: offer?.description || '',
            partner: offer?.partner || '',
            cost: offer?.cost || 0,
            discount: offer?.discount || '',
            imageUrl: offer?.imageUrl || '',
            validFrom: offer?.validFrom ? new Date(offer.validFrom).toISOString().split('T')[0] : '',
            validTo: offer?.validTo ? new Date(offer.validTo).toISOString().split('T')[0] : '',
            isActive: offer?.isActive ?? true,
        },
    });

    const onSubmit = async (data: OfferFormValues) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                id: offer?.id,
            };

            if (offer) {
                await api.put('/club/admin/offers', payload);
                toast.success('Oferta atualizada com sucesso!');
            } else {
                await api.post('/club/admin/offers', payload);
                toast.success('Oferta criada com sucesso!');
            }
            onSuccess();
        } catch (error: any) {
            console.error('Error saving offer:', error);
            toast.error(error.response?.data?.message || 'Erro ao salvar oferta');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Título</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Desconto de 10%" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Detalhes da oferta..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="partner"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Parceiro</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nome do parceiro" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="cost"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Custo (Solo Coins)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="discount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Desconto (Opcional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: 10% OFF" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>URL da Imagem (Opcional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="validFrom"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Válido de</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="validTo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Válido até</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Ativa</FormLabel>
                                <FormDescription>
                                    Ofertas inativas não aparecem para os usuários.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {offer ? 'Atualizar' : 'Criar'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
