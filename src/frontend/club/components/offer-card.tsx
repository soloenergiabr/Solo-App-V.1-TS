import { OfferModel } from '@/backend/club/models/offer.model';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

interface OfferCardProps {
    offer: OfferModel;
    onRedeem: (offerId: string) => Promise<void>;
    isRedeeming: boolean;
    userBalance: number;
}

export function OfferCard({ offer, onRedeem, isRedeeming, userBalance }: OfferCardProps) {
    const canRedeem = userBalance >= offer.cost;

    return (
        <Card className="flex flex-col h-full overflow-hidden">
            {offer.imageUrl && (
                <div className="relative w-full h-48">
                    <Image
                        src={offer.imageUrl}
                        alt={offer.title}
                        fill
                        className="object-cover"
                    />
                </div>
            )}
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{offer.title}</CardTitle>
                        <CardDescription>{offer.partner}</CardDescription>
                    </div>
                    {offer.discount && (
                        <Badge variant="secondary">{offer.discount}</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-4">
                    {offer.description}
                </p>
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
                    variant={canRedeem ? "default" : "outline"}
                >
                    {isRedeeming ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Resgatando...
                        </>
                    ) : (
                        canRedeem ? "Resgatar Oferta" : "Saldo Insuficiente"
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
