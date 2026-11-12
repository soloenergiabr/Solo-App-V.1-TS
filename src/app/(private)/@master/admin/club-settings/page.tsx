'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { withAuth } from '@/frontend/auth/contexts/auth-context';
import { apiErrorMessage, useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import { PageHeader, PageLayout } from '@/components/ui/page-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { formatBRL } from '@/frontend/telemetry-kit';

type ClubSettings = { referralRewardPercent: number; coinsDescription: string | null; updatedAt: string | null };

const EXAMPLE_PROJECT = 30000;

function ClubSettingsPage() {
    const api = useAuthenticatedApi();
    const queryClient = useQueryClient();
    const query = useQuery({
        queryKey: ['admin-club-settings'],
        enabled: api.isAuthenticated,
        queryFn: async () => (await api.get<{ data: ClubSettings }>('/admin/club-settings')).data.data,
    });

    const [percent, setPercent] = useState('');
    const [description, setDescription] = useState('');
    useEffect(() => {
        if (!query.data) return;
        setPercent(String(query.data.referralRewardPercent));
        setDescription(query.data.coinsDescription ?? '');
    }, [query.data]);

    const save = useMutation({
        mutationFn: async () => api.put('/admin/club-settings', {
            referralRewardPercent: Number(percent),
            coinsDescription: description,
        }),
        onSuccess: () => {
            toast.success('Regras do clube salvas');
            void queryClient.invalidateQueries({ queryKey: ['admin-club-settings'] });
        },
        onError: (error) => toast.error(apiErrorMessage(error, 'Não foi possível salvar as regras')),
    });

    const percentValue = Number(percent);
    const percentValid = percent !== '' && percentValue >= 0 && percentValue <= 100;

    return (
        <PageLayout header={<PageHeader title="Regras do clube" subtitle="Como os clientes ganham Solo Coins no Clube Solo" />}>
            {query.isError ? (
                <Alert variant="destructive">
                    <AlertTitle>Não foi possível carregar as regras</AlertTitle>
                    <AlertDescription>{apiErrorMessage(query.error, 'Tente novamente em instantes.')}</AlertDescription>
                </Alert>
            ) : !query.data ? (
                <Skeleton className="h-72 rounded-2xl" />
            ) : (
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle className="text-base">Comissão por indicação</CardTitle>
                        <CardDescription>
                            Quando uma indicação vira projeto fechado, o cliente que indicou recebe este percentual do valor do projeto em Solo Coins.
                            Vale para as próximas aprovações; o que já foi pago não muda.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            className="space-y-5"
                            onSubmit={(event) => {
                                event.preventDefault();
                                save.mutate();
                            }}
                        >
                            <div className="space-y-2">
                                <Label htmlFor="referral-percent">Percentual sobre o valor do projeto (%)</Label>
                                <Input
                                    id="referral-percent"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    className="max-w-40"
                                    value={percent}
                                    onChange={(event) => setPercent(event.target.value)}
                                    aria-invalid={!percentValid}
                                />
                                {percentValid ? (
                                    <p className="text-sm text-muted-foreground">
                                        Exemplo: um projeto de {formatBRL(EXAMPLE_PROJECT)} rende{' '}
                                        <strong>{(Math.round(EXAMPLE_PROJECT * percentValue) / 100).toLocaleString('pt-BR')} Solo Coins</strong> para quem indicou.
                                    </p>
                                ) : (
                                    <p className="text-sm text-destructive">Informe um percentual entre 0 e 100.</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="coins-description">Como os Solo Coins funcionam</Label>
                                <Textarea
                                    id="coins-description"
                                    rows={4}
                                    maxLength={1000}
                                    placeholder="Ex: Cada Solo Coin vale R$ 1,00 em produtos e serviços dos parceiros do clube."
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">Texto curto que explica a conversão e o uso dos Solo Coins.</p>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <span className="text-xs text-muted-foreground">
                                    {query.data.updatedAt
                                        ? `Última alteração em ${new Date(query.data.updatedAt).toLocaleString('pt-BR')}`
                                        : 'Usando o padrão de 5%.'}
                                </span>
                                <Button type="submit" disabled={!percentValid || save.isPending}>
                                    {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Salvar regras
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}
        </PageLayout>
    );
}

export default withAuth(ClubSettingsPage, ['master']);
