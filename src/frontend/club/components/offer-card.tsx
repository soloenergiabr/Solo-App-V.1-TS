import { OfferModel } from '@/backend/club/models/offer.model';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle } from 'lucide-react';
import Image from 'next/image';

interface OfferCardProps {
    offer: OfferModel;
    onRedeem: (offerId: string) => Promise<void>;
    isRedeeming: boolean;
    userBalance: number;
    /** How many times the current user has redeemed this offer */
    userRedemptionCount: number;
}

export function OfferCard({ offer, onRedeem, isRedeeming, userBalance, userRedemptionCount }: OfferCardProps) {
    const maxRedemptions = offer.maxRedemptionsPerClient;
    const remaining = maxRedemptions - userRedemptionCount;
    const hasReachedMax = remaining <= 0;
    const hasSufficientBalance = userBalance >= offer.cost;
    const canRedeem = hasSufficientBalance && !hasReachedMax;

    const getButtonContent = () => {
        if (isRedeeming) {
            return (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resgatando...
                </>
            );
        }

        // User reached max redemptions
        if (hasReachedMax) {
            return (
                <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {maxRedemptions === 1 ? 'Oferta Resgatada' : `Limite atingido (${maxRedemptions}/${maxRedemptions})`}
                </>
            );
        }

        // Insufficient balance
        if (!hasSufficientBalance) {
            return "Saldo Insuficiente";
        }

        // User can redeem
        if (maxRedemptions === 1) {
            return "Resgatar Voucher";
        }

        // maxRedemptions > 1
        if (userRedemptionCount === 0) {
            return "Resgatar Voucher";
        }

        // userRedemptionCount > 0 but not at max
        return `Resgatar (${remaining} restante${remaining > 1 ? 's' : ''})`;
    };

    const getButtonVariant = () => {
        if (hasReachedMax) return "secondary";
        if (canRedeem) return "default";
        return "outline";
    };

    return (
        <Card className={`flex flex-col h-full overflow-hidden ${hasReachedMax ? 'opacity-70' : ''}`}>
            {offer.imageUrl && (
                <div className="relative w-full h-48">
                    <Image
                        src={offer.imageUrl}
                        alt={offer.title}
                        fill
                        className="object-cover"
                    />
                    {hasReachedMax && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <Badge className="bg-green-600 text-white text-sm py-1 px-3">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {maxRedemptions === 1 ? 'Resgatado' : `${userRedemptionCount}x Resgatado`}
                            </Badge>
                        </div>
                    )}
                </div>
            )}
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{offer.title}</CardTitle>
                        <CardDescription>{offer.partner}</CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        {offer.discount && (
                            <Badge variant="secondary">{offer.discount}</Badge>
                        )}
                        {maxRedemptions > 1 && (
                            <span className="text-xs text-muted-foreground">
                                {userRedemptionCount}/{maxRedemptions} resgates
                            </span>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-xl">{offer.cost}</span>
                    <span className="text-sm text-muted-foreground">SOLO Coins</span>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    onClick={() => onRedeem(offer.id)}
                    disabled={isRedeeming || !canRedeem}
                    variant={getButtonVariant()}
                >
                    {getButtonContent()}
                </Button>
            </CardFooter>
        </Card>
    );
}
