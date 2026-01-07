'use client';

import { useClub } from '../hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClientRefererLink } from './client-referer-link';
import { LoadingPage } from '@/components/ui/loading';
import { Coins, Share2, TrendingUp, Users } from 'lucide-react';

export function SoloCoinsDashboard() {
    const {
        indicationsAsReferrer,
        balance,
        transactions,
    } = useClub();

    if (balance.isLoading || indicationsAsReferrer.isLoading) {
        return <LoadingPage />;
    }

    return (
        <div className="space-y-6">
            {/* Balance Card - Prominent */}
            <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Seu Saldo</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-primary">
                            {balance.balance?.balance || 0}
                        </span>
                        <span className="text-muted-foreground">Solo Coins</span>
                    </div>
                    {balance.error && (
                        <p className="text-sm text-destructive mt-2">{balance.error}</p>
                    )}
                </CardContent>
            </Card>

            {/* Referral Link - Action Card */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <Share2 className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Indicar Amigos</CardTitle>
                    </div>
                    <CardDescription>
                        Compartilhe seu link e ganhe 5% do valor do projeto em Solo Coins
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ClientRefererLink />
                </CardContent>
            </Card>

            {/* Indications Section */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">Minhas Indicações</CardTitle>
                        </div>
                        {indicationsAsReferrer.indications.length > 0 && (
                            <Badge variant="secondary">
                                {indicationsAsReferrer.indications.length} total
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {indicationsAsReferrer.indications.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>Nenhuma indicação ainda</p>
                            <p className="text-sm mt-1">Compartilhe seu link acima para começar!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {indicationsAsReferrer.indications.map((indication) => (
                                <div
                                    key={indication.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">
                                            {indication.referred?.name || 'Cliente'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(indication.createdAt).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {indication.status === 'approved' && indication.projectValue && (
                                            <span className="text-sm font-bold text-green-600">
                                                +{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0 }).format(indication.projectValue * 0.05)} SC
                                            </span>
                                        )}
                                        <Badge
                                            variant={indication.status === 'approved' ? 'default' : 'secondary'}
                                            className={
                                                indication.status === 'approved'
                                                    ? 'bg-green-500 hover:bg-green-600'
                                                    : ''
                                            }
                                        >
                                            {indication.status === 'approved' ? 'Aprovado' : 'Em análise'}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {indicationsAsReferrer.error && (
                        <p className="text-sm text-destructive mt-2">{indicationsAsReferrer.error}</p>
                    )}
                </CardContent>
            </Card>

            {/* Transactions Section */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Histórico de Transações</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    {transactions.transactions.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            <p>Nenhuma transação ainda</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {transactions.transactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">
                                            {transaction.description || transaction.type}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(transaction.createdAt).toLocaleDateString('pt-BR', {
                                                day: '2-digit',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <span className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {transaction.amount > 0 ? '+' : ''}{transaction.amount} SC
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                    {transactions.error && (
                        <p className="text-sm text-destructive mt-2">{transactions.error}</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
