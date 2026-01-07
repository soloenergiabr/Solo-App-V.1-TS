'use client';

import { useClub } from '../hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OffersList } from './offers-list';
import { LoadingPage } from '@/components/ui/loading';
import { Gift, Coins } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function ClubDashboard() {
    const { balance } = useClub();

    if (balance.isLoading) {
        return <LoadingPage />;
    }

    return (
        <div className="space-y-6">
            {/* Balance Quick View */}
            <Card className="bg-gradient-to-r from-primary/5 to-background">
                <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Coins className="h-8 w-8 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Seu saldo</p>
                                <p className="text-2xl font-bold text-primary">
                                    {balance.balance?.balance || 0} <span className="text-sm font-normal text-muted-foreground">Solo Coins</span>
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/solo-coins">
                                Ver detalhes
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Offers Catalog */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Ofertas Disponíveis</CardTitle>
                    </div>
                    <CardDescription>
                        Troque seus Solo Coins por prêmios exclusivos dos nossos parceiros
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <OffersList />
                </CardContent>
            </Card>
        </div>
    );
}
