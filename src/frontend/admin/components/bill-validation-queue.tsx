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

type PendingGeneration = {
    type: 'generation';
    id: string;
    clientId: string;
    clientName: string;
    plantId: string | null;
    plantName: string | null;
    power: number;
    energy: number;
    generationUnitType: string;
    timestamp: string;
    source: string | null;
    createdAt: string;
};

type PendingItem = PendingBill | PendingGeneration;

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
            const response = await api.get<ApiEnvelope<PendingItem[]>>('/admin/energy-bills/pending-review');
            return response.data.data.filter(
                (item): item is PendingBill => 'referenceMonth' in item,
            );
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

function useAdminPendingGenerations() {
    const api = useAuthenticatedApi();

    return useQuery({
        queryKey: ['admin-energy-bills', 'pending-review'],
        queryFn: async () => {
            const response = await api.get<ApiEnvelope<PendingItem[]>>('/admin/energy-bills/pending-review');
            return response.data.data.filter((item): item is PendingGeneration => item.type === 'generation');
        },
        enabled: api.isAuthenticated,
    });
}

function useApproveOrRejectGeneration() {
    const api = useAuthenticatedApi();
    const queryClient = useQueryClient();

    const invalidate = () => {
        void queryClient.invalidateQueries({ queryKey: ['admin-energy-bills', 'pending-review'] });
    };

    const approve = useMutation({
        mutationFn: async (params: { clientId: string; unitId: string }) =>
            unwrapMutation(
                api.patch(`/admin/clients/${params.clientId}/generation/${params.unitId}`, { action: 'approve' }),
            ),
        onSuccess: () => {
            toast.success('Geracao manual aprovada com sucesso');
            invalidate();
        },
        onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : 'Erro ao aprovar geracao';
            toast.error(message);
        },
    });

    const reject = useMutation({
        mutationFn: async (params: { clientId: string; unitId: string }) =>
            unwrapMutation(
                api.patch(`/admin/clients/${params.clientId}/generation/${params.unitId}`, { action: 'reject' }),
            ),
        onSuccess: () => {
            toast.success('Geracao manual rejeitada');
            invalidate();
        },
        onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : 'Erro ao rejeitar geracao';
            toast.error(message);
        },
    });

    return { approve, reject };
}

export function BillValidationQueue() {
    const { data: bills, isLoading, isError, error } = useAdminPendingBills();
    const { data: generations, isLoading: genLoading, isError: genError, error: genErrorObj } =
        useAdminPendingGenerations();
    const { confirm, reject } = useConfirmOrRejectBill();
    const { approve, reject: rejectGeneration } = useApproveOrRejectGeneration();
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

    const handleApproveGeneration = async (clientId: string, unitId: string) => {
        setProcessingId(`gen-${unitId}`);
        try {
            await approve.mutateAsync({ clientId, unitId });
        } finally {
            setProcessingId(null);
        }
    };

    const handleRejectGeneration = async (clientId: string, unitId: string) => {
        setProcessingId(`gen-${unitId}`);
        try {
            await rejectGeneration.mutateAsync({ clientId, unitId });
        } finally {
            setProcessingId(null);
        }
    };

    const isProcessing = (id: string) => processingId === id;

    const hasGenData = generations && generations.length > 0;
    const hasBillData = bills && bills.length > 0;

    return (
        <>
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

                    {!isLoading && !isError && !hasBillData && (
                        <div className="flex h-48 flex-col items-center justify-center rounded-md border border-dashed text-center">
                            <FileText className="mb-3 h-9 w-9 text-muted-foreground" />
                            <p className="font-medium">Nenhuma fatura pendente</p>
                            <p className="mt-1 max-w-md text-sm text-muted-foreground">
                                Todas as faturas enviadas foram revisadas.
                            </p>
                        </div>
                    )}

                    {!isLoading && !isError && hasBillData && (
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
                                {bills!.map(bill => (
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

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Geracoes manuais pendentes</CardTitle>
                    <CardDescription>
                        Registros de geracao inseridos manualmente aguardando aprovacao ou rejeicao.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {genLoading && (
                        <div className="flex h-48 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}

                    {genError && (
                        <div className="flex h-48 flex-col items-center justify-center text-center">
                            <XCircle className="mb-3 h-9 w-9 text-destructive" />
                            <p className="font-medium text-destructive">Erro ao carregar geracoes</p>
                            <p className="mt-1 max-w-md text-sm text-muted-foreground">
                                {genErrorObj instanceof Error
                                    ? genErrorObj.message
                                    : 'Nao foi possivel carregar as geracoes pendentes.'}
                            </p>
                        </div>
                    )}

                    {!genLoading && !genError && !hasGenData && (
                        <div className="flex h-48 flex-col items-center justify-center rounded-md border border-dashed text-center">
                            <FileText className="mb-3 h-9 w-9 text-muted-foreground" />
                            <p className="font-medium">Nenhuma geracao pendente</p>
                            <p className="mt-1 max-w-md text-sm text-muted-foreground">
                                Todas as geracoes manuais foram revisadas.
                            </p>
                        </div>
                    )}

                    {!genLoading && !genError && hasGenData && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Plant</TableHead>
                                    <TableHead>Potencia</TableHead>
                                    <TableHead>Energia</TableHead>
                                    <TableHead>Registrada em</TableHead>
                                    <TableHead className="text-right">Acoes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {generations!.map(gen => {
                                    const processingKey = `gen-${gen.id}`;
                                    return (
                                        <TableRow key={gen.id}>
                                            <TableCell className="font-medium">{gen.clientName}</TableCell>
                                            <TableCell>{gen.plantName || '-'}</TableCell>
                                            <TableCell>{gen.power.toLocaleString('pt-BR')} W</TableCell>
                                            <TableCell>{gen.energy.toLocaleString('pt-BR')} kWh</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(gen.createdAt).toLocaleDateString('pt-BR')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={() => handleApproveGeneration(gen.clientId, gen.id)}
                                                        disabled={isProcessing(processingKey)}
                                                    >
                                                        {isProcessing(processingKey) ? (
                                                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <CheckCircle2 className="mr-1 h-4 w-4" />
                                                        )}
                                                        Aprovar
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleRejectGeneration(gen.clientId, gen.id)}
                                                        disabled={isProcessing(processingKey)}
                                                    >
                                                        {isProcessing(processingKey) ? (
                                                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <XCircle className="mr-1 h-4 w-4" />
                                                        )}
                                                        Rejeitar
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
