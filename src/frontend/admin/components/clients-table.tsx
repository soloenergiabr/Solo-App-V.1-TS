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
import { Loader2, Eye, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
    const [search, setSearch] = useState('');

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

    const term = search.trim().toLowerCase();
    const digits = term.replace(/\D/g, '');
    const visible = term
        ? clients.filter((c) =>
            c.name.toLowerCase().includes(term)
            || c.email.toLowerCase().includes(term)
            || (digits.length > 0 && c.cpfCnpj.replace(/\D/g, '').includes(digits)))
        : clients;

    return (
        <div className="space-y-3">
        <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, e-mail ou CPF/CNPJ"
                className="pl-9"
                aria-label="Buscar clientes"
            />
        </div>
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
                    {visible.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                {term ? 'Nenhum cliente encontrado para essa busca.' : 'Nenhum cliente cadastrado ainda.'}
                            </TableCell>
                        </TableRow>
                    ) : (
                        visible.map((client) => (
                            <TableRow
                                key={client.id}
                                className="cursor-pointer"
                                onClick={() => router.push(`/clients/${client.id}`)}
                            >
                                <TableCell className="font-medium">{client.name}</TableCell>
                                <TableCell>{client.email}</TableCell>
                                <TableCell>
                                    {getStatusBadge(client.status)}
                                </TableCell>
                                <TableCell>
                                    {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                                </TableCell>
                                {/* Acoes nao abrem o cliente ao clicar. */}
                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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
        </div>
    );
}
