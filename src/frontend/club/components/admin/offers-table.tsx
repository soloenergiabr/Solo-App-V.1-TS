'use client';

import { useState, useEffect, useCallback } from 'react';
import { OfferModel } from '@/backend/club/models/offer.model';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { OfferForm } from './offer-form';
import { toast } from 'sonner';
import { formatBRL } from '@/frontend/telemetry-kit';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const formatDay = (date: Date | string) => new Date(date).toLocaleDateString('pt-BR');

function offerStatus(offer: OfferModel): { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' } {
    const now = new Date();
    if (!offer.isActive) return { label: 'Inativa', variant: 'secondary' };
    if (offer.validTo && new Date(offer.validTo) < now) return { label: 'Expirada', variant: 'destructive' };
    if (offer.validFrom && new Date(offer.validFrom) > now) return { label: 'Agendada', variant: 'outline' };
    return { label: 'Ativa', variant: 'default' };
}

function validityLabel(offer: OfferModel) {
    if (offer.validFrom && offer.validTo) return `${formatDay(offer.validFrom)} a ${formatDay(offer.validTo)}`;
    if (offer.validFrom) return `a partir de ${formatDay(offer.validFrom)}`;
    if (offer.validTo) return `até ${formatDay(offer.validTo)}`;
    return 'Sem prazo';
}

export function OffersTable() {
    const api = useAuthenticatedApi();
    const [offers, setOffers] = useState<OfferModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState<OfferModel | undefined>(undefined);
    const [deletingOffer, setDeletingOffer] = useState<OfferModel | null>(null);

    const fetchOffers = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/club/admin/offers');
            if (response.data.success) {
                setOffers(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
            toast.error('Erro ao carregar ofertas');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOffers();
    }, [fetchOffers]);

    const handleCreate = () => {
        setEditingOffer(undefined);
        setIsFormOpen(true);
    };

    const handleEdit = (offer: OfferModel) => {
        setEditingOffer(offer);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (offer: OfferModel) => {
        setDeletingOffer(offer);
    };

    const handleConfirmDelete = async () => {
        if (!deletingOffer) return;

        try {
            await api.delete(`/club/admin/offers?id=${deletingOffer.id}`);
            toast.success('Oferta excluída com sucesso');
            fetchOffers();
        } catch (error) {
            console.error('Error deleting offer:', error);
            toast.error('Erro ao excluir oferta');
        } finally {
            setDeletingOffer(null);
        }
    };

    const handleFormSuccess = () => {
        setIsFormOpen(false);
        fetchOffers();
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end items-center">
                <Button size={"sm"} onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Nova Oferta
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Título</TableHead>
                            <TableHead>Parceiro</TableHead>
                            <TableHead>Custo</TableHead>
                            <TableHead>Preço</TableHead>
                            <TableHead>Validade</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    Carregando...
                                </TableCell>
                            </TableRow>
                        ) : offers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    Nenhuma oferta encontrada.
                                </TableCell>
                            </TableRow>
                        ) : (
                            offers.map((offer) => (
                                <TableRow key={offer.id}>
                                    <TableCell className="font-medium">{offer.title}</TableCell>
                                    <TableCell>{offer.partner}</TableCell>
                                    <TableCell>{offer.cost} coins</TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {offer.promoPrice != null ? (
                                            <>
                                                {offer.originalPrice != null && (
                                                    <span className="mr-1 text-xs text-muted-foreground line-through">{formatBRL(offer.originalPrice, { cents: true })}</span>
                                                )}
                                                {formatBRL(offer.promoPrice, { cents: true })}
                                            </>
                                        ) : offer.originalPrice != null ? formatBRL(offer.originalPrice, { cents: true }) : '—'}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap text-sm">{validityLabel(offer)}</TableCell>
                                    <TableCell>
                                        <Badge variant={offerStatus(offer).variant}>{offerStatus(offer).label}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(offer)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteClick(offer)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{editingOffer ? 'Editar Oferta' : 'Nova Oferta'}</DialogTitle>
                    </DialogHeader>
                    <OfferForm
                        offer={editingOffer}
                        onSuccess={handleFormSuccess}
                        onCancel={() => setIsFormOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deletingOffer} onOpenChange={(open) => !open && setDeletingOffer(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente a oferta “{deletingOffer?.title}”.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
