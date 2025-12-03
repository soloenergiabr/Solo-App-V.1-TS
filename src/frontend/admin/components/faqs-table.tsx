'use client';

import { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import { FAQDialog } from './faq-dialog';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface FAQ {
    id: string;
    question: string;
    answer: string;
    category?: string;
    isActive: boolean;
    createdAt: string;
}

export function FAQsTable() {
    const api = useAuthenticatedApi();
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchFAQs = async () => {
        if (!api.isAuthenticated) return;

        try {
            setIsLoading(true);
            const response = await api.get('/admin/faqs');
            if (response.data.success) {
                setFaqs(response.data.data);
            } else {
                toast.error(response.data.message || 'Erro ao buscar FAQs');
            }
        } catch (error: any) {
            console.error('Error fetching FAQs:', error);
            toast.error('Erro ao carregar lista de FAQs');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFAQs();
    }, []);

    const handleDelete = async (id: string) => {
        try {
            const response = await api.delete(`/admin/faqs/${id}`);
            if (response.data.success) {
                toast.success('FAQ excluído com sucesso!');
                fetchFAQs();
            } else {
                toast.error(response.data.message || 'Erro ao excluir FAQ');
            }
        } catch (error: any) {
            console.error('Error deleting FAQ:', error);
            toast.error('Erro ao excluir FAQ');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Pergunta</TableHead>
                        <TableHead>Resposta</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {faqs.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                Nenhum FAQ encontrado.
                            </TableCell>
                        </TableRow>
                    ) : (
                        faqs.map((faq) => (
                            <TableRow key={faq.id}>
                                <TableCell className="font-medium">{faq.question}</TableCell>
                                <TableCell className="max-w-md truncate" title={faq.answer}>
                                    {faq.answer}
                                </TableCell>
                                <TableCell>{faq.category || '-'}</TableCell>
                                <TableCell>
                                    {faq.isActive ? (
                                        <Badge variant="default">Ativo</Badge>
                                    ) : (
                                        <Badge variant="secondary">Inativo</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <FAQDialog
                                            faq={faq}
                                            onSuccess={fetchFAQs}
                                        />
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Excluir FAQ</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Tem certeza que deseja excluir esta pergunta? Esta ação não pode ser desfeita.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(faq.id)} className="bg-destructive hover:bg-destructive/90">
                                                        Excluir
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
