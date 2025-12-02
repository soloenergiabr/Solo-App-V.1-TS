'use client';

import { useState, useEffect } from 'react';
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
import { Loader2, Pencil } from 'lucide-react';

const clientSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido'),
    phone: z.string().optional(),
    status: z.enum(['lead', 'client', 'inactive']),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface EditClientDialogProps {
    client: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        status: string;
    };
    onSuccess: () => void;
    trigger?: React.ReactNode;
}

export function EditClientDialog({ client, onSuccess, trigger }: EditClientDialogProps) {
    const [open, setOpen] = useState(false);
    const api = useAuthenticatedApi();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ClientFormValues>({
        resolver: zodResolver(clientSchema) as any,
        defaultValues: {
            name: client.name,
            email: client.email,
            phone: client.phone || '',
            status: client.status as any,
        },
    });

    // Reset form when client changes or dialog opens
    useEffect(() => {
        if (open) {
            form.reset({
                name: client.name,
                email: client.email,
                phone: client.phone || '',
                status: client.status as any,
            });
        }
    }, [client, open, form]);

    const onSubmit = async (data: ClientFormValues) => {
        setIsSubmitting(true);
        try {
            const response = await api.put(`/admin/clients/${client.id}`, data);

            if (response.data.success) {
                toast.success('Cliente atualizado com sucesso!');
                setOpen(false);
                onSuccess();
            } else {
                toast.error(response.data.message || 'Erro ao atualizar cliente');
            }
        } catch (error: any) {
            console.error('Error updating client:', error);
            toast.error(error.response?.data?.message || 'Erro ao atualizar cliente');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Cliente</DialogTitle>
                    <DialogDescription>
                        Atualize as informações e o status do cliente.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nome do cliente" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="email@exemplo.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Telefone (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="(11) 99999-9999" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="lead">Lead</SelectItem>
                                            <SelectItem value="client">Cliente</SelectItem>
                                            <SelectItem value="inactive">Inativo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
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
