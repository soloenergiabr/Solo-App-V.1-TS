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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil } from 'lucide-react';

const faqSchema = z.object({
    question: z.string().min(1, 'Pergunta é obrigatória'),
    answer: z.string().min(1, 'Resposta é obrigatória'),
    category: z.string().optional(),
    isActive: z.boolean().default(true),
});

type FAQFormValues = z.infer<typeof faqSchema>;

interface FAQDialogProps {
    faq?: {
        id: string;
        question: string;
        answer: string;
        category?: string;
        isActive: boolean;
    };
    onSuccess: () => void;
    trigger?: React.ReactNode;
}

export function FAQDialog({ faq, onSuccess, trigger }: FAQDialogProps) {
    const [open, setOpen] = useState(false);
    const api = useAuthenticatedApi();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FAQFormValues>({
        resolver: zodResolver(faqSchema) as any,
        defaultValues: {
            question: '',
            answer: '',
            category: '',
            isActive: true,
        },
    });

    useEffect(() => {
        if (open) {
            if (faq) {
                form.reset({
                    question: faq.question,
                    answer: faq.answer,
                    category: faq.category || '',
                    isActive: faq.isActive,
                });
            } else {
                form.reset({
                    question: '',
                    answer: '',
                    category: '',
                    isActive: true,
                });
            }
        }
    }, [open, faq, form]);

    const onSubmit = async (data: FAQFormValues) => {
        setIsSubmitting(true);
        try {
            let response;
            if (faq) {
                response = await api.put(`/admin/faqs/${faq.id}`, data);
            } else {
                response = await api.post('/admin/faqs', data);
            }

            if (response.data.success) {
                toast.success(faq ? 'FAQ atualizado com sucesso!' : 'FAQ criado com sucesso!');
                setOpen(false);
                onSuccess();
            } else {
                toast.error(response.data.message || 'Erro ao salvar FAQ');
            }
        } catch (error: any) {
            console.error('Error saving FAQ:', error);
            toast.error(error.response?.data?.message || 'Erro ao salvar FAQ');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    faq ? (
                        <Button variant="ghost" size="icon" title="Editar">
                            <Pencil className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Novo FAQ
                        </Button>
                    )
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{faq ? 'Editar FAQ' : 'Novo FAQ'}</DialogTitle>
                    <DialogDescription>
                        {faq ? 'Edite as informações da pergunta frequente.' : 'Crie uma nova pergunta frequente.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="question"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pergunta</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Como funciona?" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="answer"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Resposta</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Ex: Funciona assim..." className="min-h-[100px]" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Categoria (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Financeiro" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Ativo</FormLabel>
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
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {faq ? 'Salvar Alterações' : 'Criar FAQ'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
