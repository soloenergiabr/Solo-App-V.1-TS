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
import { Textarea } from '@/components/ui/textarea';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import { toast } from 'sonner';
import { Loader2, PlusCircle } from 'lucide-react';

const transactionSchema = z.object({
    amount: z.coerce.number().refine((val) => val !== 0, 'O valor não pode ser zero'),
    description: z.string().min(1, 'Descrição é obrigatória'),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface ManualTransactionDialogProps {
    clientId: string;
    onSuccess: () => void;
}

export function ManualTransactionDialog({ clientId, onSuccess }: ManualTransactionDialogProps) {
    const [open, setOpen] = useState(false);
    const api = useAuthenticatedApi();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<TransactionFormValues>({
        resolver: zodResolver(transactionSchema) as any,
        defaultValues: {
            amount: 0,
            description: '',
        },
    });

    const onSubmit = async (data: TransactionFormValues) => {
        setIsSubmitting(true);
        try {
            const response = await api.post('/admin/transactions', {
                clientId,
                ...data,
            });

            if (response.data.success) {
                toast.success('Transação criada com sucesso!');
                setOpen(false);
                form.reset();
                onSuccess();
            } else {
                toast.error(response.data.message || 'Erro ao criar transação');
            }
        } catch (error: any) {
            console.error('Error creating transaction:', error);
            toast.error(error.response?.data?.message || 'Erro ao criar transação');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nova Transação
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nova Transação Manual</DialogTitle>
                    <DialogDescription>
                        Adicione créditos (valor positivo) ou débitos (valor negativo) para este cliente.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Valor (Solo Coins)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Ex: 100 ou -50" {...field} />
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
                                        <Textarea placeholder="Motivo da transação..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirmar
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
