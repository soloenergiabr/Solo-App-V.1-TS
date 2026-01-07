'use client';

import { useState, useRef } from 'react';
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
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

const offerSchema = z.object({
    title: z.string().min(1, 'Título é obrigatório'),
    description: z.string().min(1, 'Descrição é obrigatória'),
    partner: z.string().min(1, 'Parceiro é obrigatório'),
    cost: z.coerce.number().min(0, 'Custo deve ser maior ou igual a 0'),
    discount: z.string().optional(),
    imageUrl: z.string().optional(),
    confirmationCode: z.string().optional(),
    maxRedemptionsPerClient: z.coerce.number().min(1, 'Mínimo de 1 resgate').default(1),
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
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(offer?.imageUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<OfferFormValues>({
        resolver: zodResolver(offerSchema),
        defaultValues: {
            title: offer?.title || '',
            description: offer?.description || '',
            partner: offer?.partner || '',
            cost: offer?.cost || 0,
            discount: offer?.discount || '',
            imageUrl: offer?.imageUrl || '',
            confirmationCode: offer?.confirmationCode || '',
            maxRedemptionsPerClient: offer?.maxRedemptionsPerClient ?? 1,
            validFrom: offer?.validFrom ? new Date(offer.validFrom).toISOString().split('T')[0] : '',
            validTo: offer?.validTo ? new Date(offer.validTo).toISOString().split('T')[0] : '',
            isActive: offer?.isActive ?? true,
        },
    });

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Por favor, selecione uma imagem');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('A imagem deve ter no máximo 5MB');
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                setPreviewUrl(result.data.url);
                form.setValue('imageUrl', result.data.url);
                toast.success('Imagem enviada com sucesso!');
            } else {
                toast.error(result.message || 'Erro ao enviar imagem');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Erro ao enviar imagem');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setPreviewUrl(undefined);
        form.setValue('imageUrl', '');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

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
                {/* Image Upload */}
                <FormItem>
                    <FormLabel>Imagem da Oferta</FormLabel>
                    <div className="space-y-3">
                        {previewUrl ? (
                            <div className="relative w-full h-40 rounded-lg overflow-hidden border bg-muted">
                                <Image
                                    src={previewUrl}
                                    alt="Preview"
                                    fill
                                    className="object-cover"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-8 w-8"
                                    onClick={handleRemoveImage}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div
                                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {isUploading ? (
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                ) : (
                                    <>
                                        <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                                        <p className="text-sm text-muted-foreground">
                                            Clique para fazer upload
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            PNG, JPG até 5MB
                                        </p>
                                    </>
                                )}
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                    </div>
                </FormItem>

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
                        name="maxRedemptionsPerClient"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Máx. Resgates por Cliente</FormLabel>
                                <FormControl>
                                    <Input type="number" min="1" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Quantas vezes cada cliente pode resgatar
                                </FormDescription>
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
                    <Button type="submit" disabled={isSubmitting || isUploading}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {offer ? 'Atualizar' : 'Criar'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
