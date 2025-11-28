import { useState, useEffect, useCallback } from 'react';
import { OfferModel } from '@/backend/club/models/offer.model';
import { toast } from 'sonner';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';

interface UseClubOffersReturn {
    offers: OfferModel[];
    isLoading: boolean;
    error: string | null;
    redeemOffer: (offerId: string) => Promise<boolean>;
    isRedeeming: boolean;
    refreshOffers: () => Promise<void>;
}

export function useClubOffers(): UseClubOffersReturn {
    const api = useAuthenticatedApi();
    const [offers, setOffers] = useState<OfferModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRedeeming, setIsRedeeming] = useState(false);

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

    useEffect(() => {
        fetchOffers();
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
                toast.success('Oferta resgatada com sucesso!');
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
        refreshOffers: fetchOffers
    };
}