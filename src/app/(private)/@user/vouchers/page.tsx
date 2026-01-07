'use client';

import { useState, useEffect } from 'react';
import { PageLayout, PageHeader } from '@/components/ui/page-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import { LoadingPage } from '@/components/ui/loading';
import { Ticket, CheckCircle, Clock, AlertCircle, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface Redemption {
    id: string;
    redemptionCode: string;
    status: 'pending' | 'used' | 'expired';
    redeemedAt: string;
    usedAt?: string;
    offer?: {
        title: string;
        partner: string;
        description: string;
        imageUrl?: string;
    };
}

export default function VouchersPage() {
    const api = useAuthenticatedApi();
    const [redemptions, setRedemptions] = useState<Redemption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    useEffect(() => {
        fetchRedemptions();
    }, []);

    const fetchRedemptions = async () => {
        try {
            const response = await api.get('/club/redemptions');
            if (response.data.success) {
                setRedemptions(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching redemptions:', error);
            toast.error('Erro ao carregar vouchers');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyCode = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(code);
            toast.success('Código copiado!');
            setTimeout(() => setCopiedCode(null), 2000);
        } catch {
            toast.error('Erro ao copiar código');
        }
    };

    const getStatusBadge = (status: Redemption['status']) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge className="bg-yellow-500 hover:bg-yellow-600">
                        <Clock className="h-3 w-3 mr-1" />
                        Pendente
                    </Badge>
                );
            case 'used':
                return (
                    <Badge className="bg-green-500 hover:bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Usado
                    </Badge>
                );
            case 'expired':
                return (
                    <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Expirado
                    </Badge>
                );
        }
    };

    if (isLoading) {
        return <LoadingPage />;
    }

    return (
        <PageLayout
            header={
                <PageHeader
                    title="Meus Vouchers"
                    subtitle="Acompanhe seus vouchers resgatados"
                />
            }
        >
            <div className="space-y-4">
                {redemptions.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground">
                                Você ainda não resgatou nenhuma oferta
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Acesse o Clube Solo para ver as ofertas disponíveis
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    redemptions.map((redemption) => (
                        <Card key={redemption.id} className={
                            redemption.status === 'used'
                                ? 'opacity-60'
                                : redemption.status === 'expired'
                                    ? 'opacity-40 border-destructive/30'
                                    : ''
                        }>
                            <CardContent className="p-4">
                                <div className="flex gap-4">
                                    {/* Image */}
                                    {redemption.offer?.imageUrl && (
                                        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                            <Image
                                                src={redemption.offer.imageUrl}
                                                alt={redemption.offer.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-semibold truncate">
                                                    {redemption.offer?.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {redemption.offer?.partner}
                                                </p>
                                            </div>
                                            {getStatusBadge(redemption.status)}
                                        </div>

                                        {/* Redemption Code - Prominent */}
                                        {redemption.status === 'pending' && (
                                            <div className="mt-3 p-3 bg-primary/10 rounded-lg">
                                                <p className="text-xs text-muted-foreground mb-1">
                                                    Código do voucher:
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl font-mono font-bold tracking-widest text-primary">
                                                        {redemption.redemptionCode}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleCopyCode(redemption.redemptionCode)}
                                                    >
                                                        {copiedCode === redemption.redemptionCode ? (
                                                            <Check className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <Copy className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Mostre este código ao parceiro para validar
                                                </p>
                                            </div>
                                        )}

                                        <p className="text-xs text-muted-foreground mt-2">
                                            Resgatado em {new Date(redemption.redeemedAt).toLocaleDateString('pt-BR')}
                                            {redemption.usedAt && (
                                                <> • Usado em {new Date(redemption.usedAt).toLocaleDateString('pt-BR')}</>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </PageLayout>
    );
}
