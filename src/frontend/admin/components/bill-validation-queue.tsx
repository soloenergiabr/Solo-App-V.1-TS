'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

type PendingBill = {
    id: string;
    clientId: string;
    clientName: string;
    consumerUnitId: string;
    consumerUnitName: string | null;
    consumerUnitNumber: string | null;
    referenceMonth: number;
    referenceYear: number;
    totalBillValue: number | null;
    totalAmount: number | null;
    billFileUrl: string | null;
    status: string | null;
    createdAt: string;
};

type ApiEnvelope<T> = {
    success: boolean;
    data: T;
    message?: string;
};

async function unwrapMutation<T>(request: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
    const response = await request;
    if (!response.data.success) {
        throw new Error(response.data.message || 'Operacao nao concluida');
    }
    return response.data.data;
}

function currency(value: number | null): string {
    if (value === null || value === undefined) return '-';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function monthYear(month: number, year: number): string {
    return `${String(month).padStart(2, '0')}/${year}`;
}

function useAdminPendingBills() {
    const api = useAuthenticatedApi();

    return useQuery({
        queryKey: ['admin-energy-bills', 'pending-review'],
        queryFn: async () => {
            const response = await api.get<ApiEnvelope<PendingBill[]>>('/admin/energy-bills/pending-review');
            return response.data.data;
        },
        enabled: api.isAuthenticated,
    });
}

function useConfirmOrRejectBill() {
    const api = useAuthenticatedApi();
    const queryClient = useQueryClient();

    const invalidate = () => {
        void queryClient.invalidateQueries({ queryKey: ['admin-energy-bills', 'pending-review'] });
    };

    const confirm = useMutation({
        mutationFn: async (billId: string) =>
            unwrapMutation(api.patch(`/admin/energy-bills/pending-review/${billId}`, { action: 'confirm' })),
        onSuccess: () => {
            toast.success('Fatura confirmada com sucesso');
            invalidate();
        },
        onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : 'Erro ao confirmar fatura';
            toast.error(message);
        },
    });

    const reject = useMutation({
        mutationFn: async (billId: string) =>
            unwrapMutation(api.patch(`/admin/energy-bills/pending-review/${billId}`, { action: 'reject' })),
        onSuccess: () => {
            toast.success('Fatura rejeitada');
            invalidate();
        },
        onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : 'Erro ao rejeitar fatura';
            toast.error(message);
        },
    });

    return { confirm, reject };
}

export function BillValidationQueue() {
    const { data: bills, isLoading, isError, error } = useAdminPendingBills();
    const { confirm, reject } = useConfirmOrRejectBill();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleConfirm = async (billId: string) => {
        setProcessingId(billId);
        try {
            await confirm.mutateAsync(billId);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (billId: string) => {
        setProcessingId(billId);
        try {
            await reject.mutateAsync(billId);
        } finally {
            setProcessingId(null);
        }
    };

    const isProcessing = (billId: string) => processingId === billId;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Faturas pendentes de revisao</CardTitle>
                <CardDescription>
                    Faturas enviadas por clientes aguardando confirmacao ou rejeicao.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && (
                    <div className="flex h-48 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}

                {isError && (
                    <div className="flex h-48 flex-col items-center justify-center text-center">
                        <XCircle className="mb-3 h-9 w-9 text-destructive" />
                        <p className="font-medium text-destructive">Erro ao carregar faturas</p>
                        <p className="mt-1 max-w-md text-sm text-muted-foreground">
                            {error instanceof Error ? error.message : 'Nao foi possivel carregar as faturas pendentes.'}
                        </p>
                    </div>
                )}

                {!isLoading && !isError && bills && bills.length === 0 && (
                    <div className="flex h-48 flex-col items-center justify-center rounded-md border border-dashed text-center">
                        <FileText className="mb-3 h-9 w-9 text-muted-foreground" />
                        <p className="font-medium">Nenhuma fatura pendente</p>
                        <p className="mt-1 max-w-md text-sm text-muted-foreground">
                            Todas as faturas enviadas foram revisadas.
                        </p>
                    </div>
                )}

                {!isLoading && !isError && bills && bills.length > 0 && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Unidade</TableHead>
                                <TableHead>Referencia</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Enviada em</TableHead>
                                <TableHead className="text-right">Acoes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bills.map(bill => (
                                <TableRow key={bill.id}>
                                    <TableCell className="font-medium">{bill.clientName}</TableCell>
                                    <TableCell>
                                        {bill.consumerUnitName || bill.consumerUnitNumber || '-'}
                                    </TableCell>
                                    <TableCell>{monthYear(bill.referenceMonth, bill.referenceYear)}</TableCell>
                                    <TableCell>
                                        {currency(bill.totalBillValue ?? bill.totalAmount)}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(bill.createdAt).toLocaleDateString('pt-BR')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {bill.billFileUrl && (
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={bill.billFileUrl} target="_blank" rel="noreferrer">
                                                        PDF
                                                    </a>
                                                </Button>
                                            )}
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => handleConfirm(bill.id)}
                                                disabled={isProcessing(bill.id)}
                                            >
                                                {isProcessing(bill.id) ? (
                                                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle2 className="mr-1 h-4 w-4" />
                                                )}
                                                Confirmar
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleReject(bill.id)}
                                                disabled={isProcessing(bill.id)}
                                            >
                                                {isProcessing(bill.id) ? (
                                                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <XCircle className="mr-1 h-4 w-4" />
                                                )}
                                                Rejeitar
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
