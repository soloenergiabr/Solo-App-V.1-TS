'use client';

import { useClub } from '../hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
                                        <div>
                                            <p className="font-medium">
                                                {indication.referred?.name || 'Cliente'}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(indication.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Badge variant={indication.status === 'approved' ? 'default' : 'secondary'}>
                                            {indication.status}
                                        </Badge>
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
