'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import { PageHeader, PageLayout } from '@/components/ui/page-layout';
import { withAuth } from '@/frontend/auth/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle2, XCircle, ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ApprovalItem = {
    type: 'plant' | 'consumer_unit';
    id: string;
    name: string;
    clientName: string;
    clientId: string;
    createdAt: string;
    validationStatus: string;
    rejectionReason: string | null;
};

type ApiEnvelope<T> = {
    success: boolean;
    data: T;
    message?: string;
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

function useApprovals() {
    const api = useAuthenticatedApi();

    return useQuery({
        queryKey: ['admin-approvals', 'pending'],
        queryFn: async () => {
            const response = await api.get<ApiEnvelope<ApprovalItem[]>>('/admin/approvals');
            return response.data.data;
        },
        enabled: api.isAuthenticated,
        refetchInterval: 30_000,
    });
}

function useApproveItem() {
    const api = useAuthenticatedApi();
    const queryClient = useQueryClient();

    const invalidate = () => {
        void queryClient.invalidateQueries({ queryKey: ['admin-approvals', 'pending'] });
    };

    return useMutation({
        mutationFn: async (item: ApprovalItem) => {
            if (item.type === 'plant') {
                return api.patch(`/admin/clients/${item.clientId}/plants/${item.id}`, {
                    validationStatus: 'confirmed',
                });
            }
            return api.patch(`/admin/clients/${item.clientId}/consumer-units/${item.id}`, {
                validationStatus: 'confirmed',
            });
        },
        onSuccess: () => {
            toast.success('Item aprovado com sucesso');
            invalidate();
        },
        onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : 'Erro ao aprovar item';
            toast.error(message);
        },
    });
}

function useRejectItem() {
    const api = useAuthenticatedApi();
    const queryClient = useQueryClient();

    const invalidate = () => {
        void queryClient.invalidateQueries({ queryKey: ['admin-approvals', 'pending'] });
    };

    return useMutation({
        mutationFn: async ({ item, reason }: { item: ApprovalItem; reason?: string }) => {
            const body: { validationStatus: string; rejectionReason?: string } = {
                validationStatus: 'rejected',
            };
            if (reason && reason.trim()) {
                body.rejectionReason = reason.trim();
            }

            if (item.type === 'plant') {
                return api.patch(`/admin/clients/${item.clientId}/plants/${item.id}`, body);
            }
            return api.patch(`/admin/clients/${item.clientId}/consumer-units/${item.id}`, body);
        },
        onSuccess: () => {
            toast.success('Item rejeitado');
            invalidate();
        },
        onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : 'Erro ao rejeitar item';
            toast.error(message);
        },
    });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function typeLabel(type: ApprovalItem['type']): string {
    return type === 'plant' ? 'Usina' : 'Unidade Consumidora';
}

function typeBadgeVariant(type: ApprovalItem['type']): 'default' | 'secondary' {
    return type === 'plant' ? 'default' : 'secondary';
}

// ---------------------------------------------------------------------------
// Reject Reason Dialog
// ---------------------------------------------------------------------------

function RejectDialog({
    item,
    open,
    onOpenChange,
}: {
    item: ApprovalItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const rejectMutation = useRejectItem();
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleReject = async () => {
        if (!item) return;
        setSubmitting(true);
        try {
            await rejectMutation.mutateAsync({ item, reason: reason || undefined });
            onOpenChange(false);
            setReason('');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) setReason(''); }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rejeitar {item ? typeLabel(item.type) : 'item'}</DialogTitle>
                    <DialogDescription>
                        {item
                            ? `Tem certeza que deseja rejeitar "${item.name}" de ${item.clientName}?`
                            : 'Tem certeza?'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <Label htmlFor="rejection-reason">Motivo da rejeicao (opcional)</Label>
                    <Textarea
                        id="rejection-reason"
                        placeholder="Descreva o motivo da rejeicao..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                        Cancelar
                    </Button>
                    <Button variant="destructive" onClick={handleReject} disabled={submitting}>
                        {submitting ? (
                            <>
                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                Rejeitando...
                            </>
                        ) : (
                            <>
                                <XCircle className="mr-1 h-4 w-4" />
                                Rejeitar
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

function ApprovalsPage() {
    const { data: items, isLoading, isError, error } = useApprovals();
    const approveMutation = useApproveItem();
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [rejectTarget, setRejectTarget] = useState<ApprovalItem | null>(null);

    const handleApprove = async (item: ApprovalItem) => {
        setProcessingId(item.id);
        try {
            await approveMutation.mutateAsync(item);
        } finally {
            setProcessingId(null);
        }
    };

    const hasData = items && items.length > 0;

    return (
        <PageLayout
            header={
                <PageHeader
                    title="Aprovacoes Pendentes"
                    subtitle="Plantas e unidades consumidoras aguardando validacao"
                />
            }
        >
            <Card>
                <CardContent className="p-0">
                    {/* Loading */}
                    {isLoading && (
                        <div className="flex h-48 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}

                    {/* Error */}
                    {isError && !isLoading && (
                        <div className="flex h-48 flex-col items-center justify-center text-center">
                            <XCircle className="mb-3 h-9 w-9 text-destructive" />
                            <p className="font-medium text-destructive">Erro ao carregar aprovacoes</p>
                            <p className="mt-1 max-w-md text-sm text-muted-foreground">
                                {error instanceof Error
                                    ? error.message
                                    : 'Nao foi possivel carregar as aprovacoes pendentes.'}
                            </p>
                        </div>
                    )}

                    {/* Empty */}
                    {!isLoading && !isError && !hasData && (
                        <div className="flex h-48 flex-col items-center justify-center rounded-md border border-dashed text-center m-6">
                            <ClipboardCheck className="mb-3 h-9 w-9 text-muted-foreground" />
                            <p className="font-medium">Nenhuma pendencia</p>
                            <p className="mt-1 max-w-md text-sm text-muted-foreground">
                                Todas as plantas e unidades consumidoras foram revisadas.
                            </p>
                        </div>
                    )}

                    {/* Table */}
                    {!isLoading && !isError && hasData && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Data do Pedido</TableHead>
                                    <TableHead className="text-right">Acoes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items!.map((item) => (
                                    <TableRow key={`${item.type}-${item.id}`}>
                                        <TableCell className="font-medium">
                                            {item.clientName}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={typeBadgeVariant(item.type)}>
                                                {typeLabel(item.type)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDate(item.createdAt)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => handleApprove(item)}
                                                    disabled={processingId === item.id}
                                                >
                                                    {processingId === item.id ? (
                                                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="mr-1 h-4 w-4" />
                                                    )}
                                                    Aprovar
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => setRejectTarget(item)}
                                                    disabled={processingId === item.id}
                                                >
                                                    <XCircle className="mr-1 h-4 w-4" />
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

            {/* Reject reason dialog */}
            <RejectDialog
                item={rejectTarget}
                open={rejectTarget !== null}
                onOpenChange={(open) => {
                    if (!open) setRejectTarget(null);
                }}
            />
        </PageLayout>
    );
}

export default withAuth(ApprovalsPage, ['master']);
