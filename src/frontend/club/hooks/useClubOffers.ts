import { useState, useEffect, useCallback } from 'react';
import { OfferModel } from '@/backend/club/models/offer.model';
import { toast } from 'sonner';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import { useRouter } from 'next/navigation';

interface UseClubOffersReturn {
    offers: OfferModel[];
    isLoading: boolean;
    error: string | null;
    redeemOffer: (offerId: string) => Promise<boolean>;
    isRedeeming: boolean;
    /** Map of offerId -> number of times redeemed by current user */
    redemptionCounts: Map<string, number>;
    refreshOffers: () => Promise<void>;
}

export function useClubOffers(): UseClubOffersReturn {
    const api = useAuthenticatedApi();
    const router = useRouter();
    const [offers, setOffers] = useState<OfferModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [redemptionCounts, setRedemptionCounts] = useState<Map<string, number>>(new Map());

    const fetchOffers = useCallback(async () => {
        if (!api.isAuthenticated) return;

        try {
            setIsLoading(true);
            setError(null);
            const response = await api.get('/club/offers');

            if (response.data.success) {
                setOffers(response.data.data);
            } else {
                throw new Error(response.data.message || 'Failed to fetch offers');
            }
        } catch (err: any) {
            console.error('Error fetching offers:', err);
            setError(err.message || 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [api]);

    // Fetch client's redemptions to count how many times each offer was redeemed
    const fetchRedemptions = useCallback(async () => {
        if (!api.isAuthenticated) return;

        try {
            const response = await api.get('/club/redemptions');
            if (response.data.success) {
                const counts = new Map<string, number>();
                for (const redemption of response.data.data) {
                    const current = counts.get(redemption.offerId) || 0;
                    counts.set(redemption.offerId, current + 1);
                }
                setRedemptionCounts(counts);
            }
        } catch (err) {
            console.error('Error fetching redemptions:', err);
        }
    }, [api]);

    useEffect(() => {
        fetchOffers();
        fetchRedemptions();
    }, []);

    const redeemOffer = async (offerId: string): Promise<boolean> => {
        if (!api.isAuthenticated) {
            toast.error('Usuário não autenticado');
            return false;
        }

        try {
            setIsRedeeming(true);
            const response = await api.post('/club/redeem-offer', { offerId });

            if (response.data.success) {
                const redemptionCode = response.data.data.redemptionCode;
                toast.success(
                    `Oferta resgatada com sucesso! Seu código: ${redemptionCode}`,
                    {
                        duration: 8000,
                        action: {
                            label: 'Ver Vouchers',
                            onClick: () => router.push('/vouchers'),
                        },
                    }
                );
                // Increment redemption count for this offer
                setRedemptionCounts(prev => {
                    const newMap = new Map(prev);
                    const current = newMap.get(offerId) || 0;
                    newMap.set(offerId, current + 1);
                    return newMap;
                });
                return true;
            } else {
                throw new Error(response.data.message || 'Failed to redeem offer');
            }
        } catch (err: any) {
            console.error('Error redeeming offer:', err);
            toast.error(err.response?.data?.message || err.message || 'Erro ao resgatar oferta');
            return false;
        } finally {
            setIsRedeeming(false);
        }
    };

    return {
        offers,
        isLoading,
        error,
        redeemOffer,
        isRedeeming,
        redemptionCounts,
        refreshOffers: fetchOffers
    };
}