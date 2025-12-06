'use client';

import { useClub } from '../hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientRefererLink } from './client-referer-link';
import { OffersList } from './offers-list';
import { LoadingPage } from '@/components/ui/loading';

export function ClubDashboard() {
    const {
        indicationsAsReferrer,
        indicationsAsReferred,
        balance,
        transactions,
    } = useClub();

    if (balance.isLoading || indicationsAsReferrer.isLoading) {
        return <LoadingPage />;
    }

    return (
        <div className="space-y-6">
            {/* Link de Indicação */}

            {/* Saldo */}
            <div>
                <CardTitle>Saldo Solo Coins</CardTitle>
                <CardDescription>Seus créditos para resgates</CardDescription>
                <div className="text-3xl font-bold mt-4">
                    {balance.balance?.balance || 0} <span className="text-sm text-muted-foreground">SOLO Coins</span>
                </div>
                {balance.error && (
                    <p className="text-sm text-red-600 mt-2">{balance.error}</p>
                )}
            </div>

            <OffersList />

            <div className="w-full">
                {/* Indicações como Referrer */}
                <Card>
                    <CardHeader>
                        <CardTitle>Minhas Indicações</CardTitle>
                        <CardDescription>Pessoas que você indicou</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {indicationsAsReferrer.indications.length === 0 ? (
                            <p className="text-muted-foreground">Nenhuma indicação ainda</p>
                        ) : (
                            <div className="space-y-2">
                                {indicationsAsReferrer.indications.slice(0, 5).map((indication) => (
                                    <div key={indication.id} className="flex justify-between items-center">
                                        <div className="flex-1">
                                            <p className="font-medium">
                                                {indication.referred?.name || 'Cliente'}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(indication.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-24 text-right mr-3">
                                                {indication.status === 'approved' && indication.projectValue && (
                                                    <span className="text-sm font-bold text-green-600">
                                                        +{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(indication.projectValue * 0.05)} SC
                                                    </span>
                                                )}
                                            </div>
                                            <div className="w-28">
                                                <Badge
                                                    className={`${indication.status === 'approved'
                                                        ? 'bg-green-500 hover:bg-green-600'
                                                        : 'bg-blue-500 hover:bg-blue-600'
                                                        }`}
                                                >
                                                    {indication.status === 'approved' ? 'Ganho' : 'Em andamento'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {indicationsAsReferrer.indications.length > 5 && (
                                    <p className="text-sm text-muted-foreground">
                                        +{indicationsAsReferrer.indications.length - 5} mais
                                    </p>
                                )}
                            </div>
                        )}
                        {indicationsAsReferrer.error && (
                            <p className="text-sm text-red-600 mt-2">{indicationsAsReferrer.error}</p>
                        )}


                    </CardContent>
                </Card>
            </div>

            <ClientRefererLink />


            {/* Transações Recentes */}
            <Card>
                <CardHeader>
                    <CardTitle>Transações Recentes</CardTitle>
                    <CardDescription>Histórico de seus solo coins</CardDescription>
                </CardHeader>
                <CardContent>
                    {transactions.transactions.length === 0 ? (
                        <p className="text-muted-foreground">Nenhuma transação ainda</p>
                    ) : (
                        <div className="space-y-2">
                            {transactions.transactions.slice(0, 10).map((transaction) => (
                                <div key={transaction.id} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{transaction.type}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {transaction.description || 'Transação'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(transaction.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                                    </div>
                                </div>
                            ))}
                            {transactions.transactions.length > 10 && (
                                <p className="text-sm text-muted-foreground">
                                    +{transactions.transactions.length - 10} mais
                                </p>
                            )}
                        </div>
                    )}
                    {transactions.error && (
                        <p className="text-sm text-red-600 mt-2">{transactions.error}</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
