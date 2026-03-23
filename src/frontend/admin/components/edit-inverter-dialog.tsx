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
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
    name: z.string().min(1, 'O nome é obrigatório'),
});

type FormValues = z.infer<typeof formSchema>;

interface EditInverterDialogProps {
    inverter: {
        id: string;
        name: string;
        provider: string;
        providerId: string;
    };
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function EditInverterDialog({ inverter, open, onOpenChange, onSuccess }: EditInverterDialogProps) {
    const api = useAuthenticatedApi();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: inverter.name || inverter.provider,
        },
    });

    // Reset default values when inverter changes
    useState(() => {
        if (open) {
            form.reset({ name: inverter.name || inverter.provider });
        }
    });

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        try {
            const response = await api.put(`/admin/inverters/${inverter.id}`, data);
            
            if (response.data.success) {
                toast.success('Inversor atualizado com sucesso!');
                onOpenChange(false);
                onSuccess();
            } else {
                toast.error(response.data.message || 'Erro ao atualizar o inversor');
            }
        } catch (error: any) {
            console.error('Update inverter error:', error);
            const msg = error.response?.data?.message || 'Erro na comunicação com o servidor.';
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Inversor</DialogTitle>
                    <DialogDescription>
                        Altere o nome amigável do inversor conectado.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Inversor (Planta)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Casa Praia" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormItem>
                                <FormLabel className="text-muted-foreground">Provider</FormLabel>
                                <FormControl>
                                    <Input value={inverter.provider} disabled />
                                </FormControl>
                            </FormItem>
                            <FormItem>
                                <FormLabel className="text-muted-foreground">ID do Provider</FormLabel>
                                <FormControl>
                                    <Input value={inverter.providerId} disabled />
                                </FormControl>
                            </FormItem>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Salvar Alterações
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
