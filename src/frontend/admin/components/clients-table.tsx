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
import { EditClientDialog } from './edit-client-dialog';
import { DeleteClientDialog } from './delete-client-dialog';
import { Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

interface Client {
    id: string;
    name: string;
    email: string;
    status: string;
    createdAt: string;
    phone?: string;
    cpfCnpj: string;
}

export function ClientsTable() {
    const api = useAuthenticatedApi();
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    useEffect(() => {
        fetchClients();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'client':
                return <Badge variant="default">Cliente</Badge>;
            case 'lead':
                return <Badge variant="secondary">Lead</Badge>;
            case 'inactive':
                return <Badge variant="destructive">Inativo</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
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
                                    {getStatusBadge(client.status)}
                                </TableCell>
                                <TableCell>
                                    {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => router.push(`/clients/${client.id}`)}
                                            title="Ver Detalhes"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <EditClientDialog
                                            client={client}
                                            onSuccess={fetchClients}
                                        />
                                        <DeleteClientDialog
                                            clientId={client.id}
                                            clientName={client.name}
                                            clientStatus={client.status}
                                            clientCpf={client.cpfCnpj}
                                            onSuccess={fetchClients}
                                        />
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
