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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import { toast } from 'sonner';
import { Loader2, Trash2, Ban } from 'lucide-react';

interface DeleteClientDialogProps {
    clientId: string;
    clientName: string;
    clientStatus: string;
    clientCpf: string;
    onSuccess: () => void;
    trigger?: React.ReactNode;
}

export function DeleteClientDialog({
    clientId,
    clientName,
    clientStatus,
    clientCpf,
    onSuccess,
    trigger
}: DeleteClientDialogProps) {
    const [open, setOpen] = useState(false);
    const api = useAuthenticatedApi();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmationCpf, setConfirmationCpf] = useState('');

    const isInactive = clientStatus === 'inactive';

    const handleDelete = async () => {
        if (isInactive && confirmationCpf !== clientCpf) {
            toast.error('CPF incorreto. Verifique e tente novamente.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await api.delete(`/admin/clients/${clientId}`);

            if (response.data.success) {
                toast.success(response.data.message || (isInactive ? 'Cliente excluído permanentemente!' : 'Cliente desativado com sucesso!'));
                setOpen(false);
                setConfirmationCpf('');
                onSuccess();
            } else {
                toast.error(response.data.message || 'Erro ao processar solicitação');
            }
        } catch (error: any) {
            console.error('Error deleting client:', error);
            toast.error(error.response?.data?.message || 'Erro ao processar solicitação');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) setConfirmationCpf('');
        }}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        variant="ghost"
                        size="icon"
                        className={isInactive ? "text-destructive hover:text-destructive/90" : "text-orange-500 hover:text-orange-600"}
                        title={isInactive ? "Excluir Permanentemente" : "Desativar Cliente"}
                    >
                        {isInactive ? <Trash2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isInactive ? 'Excluir Permanentemente' : 'Desativar Cliente'}</DialogTitle>
                    <DialogDescription>
                        {isInactive
                            ? `Tem certeza que deseja excluir permanentemente o cliente ${clientName}? Esta ação é irreversível e apagará todos os dados.`
                            : `Tem certeza que deseja desativar o cliente ${clientName}? Ele ficará inativo no sistema.`}
                    </DialogDescription>
                </DialogHeader>

                {isInactive && (
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="cpf-confirm">
                                Digite o CPF do cliente para confirmar: <strong>{clientCpf}</strong>
                            </Label>
                            <Input
                                id="cpf-confirm"
                                value={confirmationCpf}
                                onChange={(e) => setConfirmationCpf(e.target.value)}
                                placeholder="Digite o CPF"
                            />
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button
                        variant={isInactive ? "destructive" : "default"}
                        onClick={handleDelete}
                        disabled={isSubmitting || (isInactive && confirmationCpf !== clientCpf)}
                        className={!isInactive ? "bg-orange-500 hover:bg-orange-600" : ""}
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isInactive ? 'Excluir Permanentemente' : 'Desativar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
