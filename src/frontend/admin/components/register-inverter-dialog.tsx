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

const inverterSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    provider: z.string().min(1, 'Provedor é obrigatório'),
    providerId: z.string().min(1, 'ID do Provedor é obrigatório'),
    providerApiKey: z.string().optional(),
    providerApiSecret: z.string().optional(),
    providerUrl: z.string().url('URL inválida').optional().or(z.literal('')),
});

type InverterFormValues = z.infer<typeof inverterSchema>;

interface RegisterInverterDialogProps {
    clientId: string;
    onSuccess: () => void;
}

export function RegisterInverterDialog({ clientId, onSuccess }: RegisterInverterDialogProps) {
    const [open, setOpen] = useState(false);
    const api = useAuthenticatedApi();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<InverterFormValues>({
        resolver: zodResolver(inverterSchema) as any,
        defaultValues: {
            name: '',
            provider: '',
            providerId: '',
            providerApiKey: '',
            providerApiSecret: '',
            providerUrl: '',
        },
    });

    const onSubmit = async (data: InverterFormValues) => {
        setIsSubmitting(true);
        try {
            const response = await api.post('/admin/inverters', {
                clientId,
                ...data,
                // Clean up empty strings for optional fields
                providerApiKey: data.providerApiKey || undefined,
                providerApiSecret: data.providerApiSecret || undefined,
                providerUrl: data.providerUrl || undefined,
            });

            if (response.data.success) {
                toast.success('Inversor registrado com sucesso!');
                setOpen(false);
                form.reset();
                onSuccess();
            } else {
                toast.error(response.data.message || 'Erro ao registrar inversor');
            }
        } catch (error: any) {
            console.error('Error registering inverter:', error);
            toast.error(error.response?.data?.message || 'Erro ao registrar inversor');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size={"sm"}>
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Inversor
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Registrar Novo Inversor</DialogTitle>
                    <DialogDescription>
                        Adicione um novo inversor para este cliente.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Inversor</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Casa Praia" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="provider"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Provedor</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um provedor" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="solis">Solis</SelectItem>
                                            <SelectItem value="solplanet">Solplanet</SelectItem>
                                            <SelectItem value="growatt">Growatt</SelectItem>
                                            <SelectItem value="other">Outro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="providerId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ID no Provedor</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ID do inversor na API do fabricante" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="providerApiKey"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>API Key (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Chave de API" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="providerApiSecret"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>API Secret (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Segredo da API" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="providerUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL da API (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://api.example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Registrar
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
