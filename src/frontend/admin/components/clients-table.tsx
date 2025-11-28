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
import { Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

interface Client {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    createdAt: string;
}

export function ClientsTable() {
    const api = useAuthenticatedApi();
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchClients = async () => {
            if (!api.isAuthenticated) return;

            try {
                setIsLoading(true);
                const response = await api.get('/admin/clients');
                if (response.data.success) {
                    setClients(response.data.data);
                } else {
                    toast.error(response.data.message || 'Erro ao buscar clientes');
                }
            } catch (error: any) {
                console.error('Error fetching clients:', error);
                toast.error('Erro ao carregar lista de clientes');
            } finally {
                setIsLoading(false);
            }
        };

        fetchClients();
    }, []);

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
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data de Cadastro</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {clients.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                Nenhum cliente encontrado.
                            </TableCell>
                        </TableRow>
                    ) : (
                        clients.map((client) => (
                            <TableRow key={client.id}>
                                <TableCell className="font-medium">{client.name}</TableCell>
                                <TableCell>{client.email}</TableCell>
                                <TableCell>
                                    <Badge variant={client.isActive ? 'default' : 'secondary'}>
                                        {client.isActive ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => router.push(`/clients/${client.id}`)}
                                        title="Ver Detalhes"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
