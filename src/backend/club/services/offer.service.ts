import { TransactionRepository } from "../repositories/transaction.repository";
import { OfferModel } from "../models/offer.model";
import { UserContext } from '@/backend/auth/models/user-context.model';
import { OfferRepository } from "../repositories/offer.repository";

export class OfferService {
    constructor(
        private offerRepository: OfferRepository
    ) { }

    async getAllOffers(): Promise<OfferModel[]> {
        return this.offerRepository.findActive();
    }

    async getOfferById(id: string): Promise<OfferModel | null> {
        return this.offerRepository.findById(id);
    }

    async createOffer(offer: OfferModel): Promise<OfferModel> {
        return this.offerRepository.create(offer);
    }

    async updateOffer(offer: OfferModel): Promise<void> {
        return this.offerRepository.update(offer);
    }

    async deleteOffer(id: string): Promise<void> {
        return this.offerRepository.delete(id);
    }
}
