"use client"

import { useClubOffers } from '../hooks/useClubOffers';
import { useClub } from '../hooks';
import { OfferCard } from './offer-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function OffersList() {
    const { offers, isLoading: isLoadingOffers, redeemOffer, isRedeeming, redemptionCounts } = useClubOffers();
    const { balance } = useClub();

    const handleRedeem = async (offerId: string) => {
        const success = await redeemOffer(offerId);
        if (success) {
            // Refresh balance after successful redemption
            balance.refetch();
        }
    };

    if (isLoadingOffers) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="h-[300px]">
                            <CardHeader>
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-[100px] w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {offers.length === 0 ? (
                <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        Nenhuma oferta disponível no momento.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offers.map((offer) => (
                        <OfferCard
                            key={offer.id}
                            offer={offer}
                            onRedeem={handleRedeem}
                            isRedeeming={isRedeeming}
                            userBalance={balance.balance?.balance || 0}
                            userRedemptionCount={redemptionCounts.get(offer.id) || 0}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
