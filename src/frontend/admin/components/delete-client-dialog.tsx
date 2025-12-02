'use client';

import { useState } from 'react';
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
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';

interface DeleteClientDialogProps {
    clientId: string;
    clientName: string;
    onSuccess: () => void;
    trigger?: React.ReactNode;
}

export function DeleteClientDialog({ clientId, clientName, onSuccess, trigger }: DeleteClientDialogProps) {
    const [open, setOpen] = useState(false);
    const api = useAuthenticatedApi();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDelete = async () => {
        setIsSubmitting(true);
        try {
            const response = await api.delete(`/admin/clients/${clientId}`);

            if (response.data.success) {
                toast.success('Cliente removido com sucesso!');
                setOpen(false);
                onSuccess();
            } else {
                toast.error(response.data.message || 'Erro ao remover cliente');
            }
        } catch (error: any) {
            console.error('Error deleting client:', error);
            toast.error(error.response?.data?.message || 'Erro ao remover cliente');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Excluir Cliente</DialogTitle>
                    <DialogDescription>
                        Tem certeza que deseja excluir o cliente <strong>{clientName}</strong>? Esta ação não pode ser desfeita.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Excluir
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
