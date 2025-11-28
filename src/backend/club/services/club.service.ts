import { IndicationRepository } from "../repositories/indication.repository";
import { TransactionRepository } from "../repositories/transaction.repository";
import { IndicationService } from "./indication.service";
import { TransactionService } from "./transaction.service";
import { UserContext } from '@/backend/auth/models/user-context.model';

// Types for the orchestrator service
import type {
    GetIndicationsRequest,
    GetIndicationsResponse
} from "../use-cases/get-indications.use-case";
import { OfferService } from "./offer.service";
import { OfferRepository } from "../repositories/offer.repository";
import { OfferModel } from "../models/offer.model";

/**
 * Main orchestrator service that coordinates between specialized services
 * This service acts as a facade for the club domain
 */
export class ClubService {
    public indicationService: IndicationService;
    public transactionService: TransactionService;
    public offerService: OfferService;

    constructor(
        indicationRepository: IndicationRepository,
        transactionRepository: TransactionRepository,
        offerRepository: OfferRepository
    ) {
        this.indicationService = new IndicationService(indicationRepository);
        this.transactionService = new TransactionService(transactionRepository);
        this.offerService = new OfferService(offerRepository);
    }

    // Indication operations - delegate to IndicationService
    async getIndications(request: GetIndicationsRequest, userContext: UserContext): Promise<GetIndicationsResponse> {
        return await this.indicationService.getIndications(request, userContext);
    }

    // Transaction operations - delegate to TransactionService
    async getClientTransactions(userContext: UserContext) {
        return await this.transactionService.getClientTransactions(userContext);
    }

    async getClientBalance(userContext: UserContext): Promise<number> {
        return await this.transactionService.getClientBalance(userContext);
    }

    async hasSufficientBalance(userContext: UserContext, amount: number): Promise<boolean> {
        return await this.transactionService.hasSufficientBalance(userContext, amount);
    }

    async getAllOffers(): Promise<OfferModel[]> {
        return await this.offerService.getAllOffers();
    }

    async getOfferById(id: string): Promise<OfferModel | null> {
        return await this.offerService.getOfferById(id);
    }

    async createOffer(offer: OfferModel): Promise<OfferModel> {
        return await this.offerService.createOffer(offer);
    }

    async updateOffer(offer: OfferModel): Promise<void> {
        return await this.offerService.updateOffer(offer);
    }

    async deleteOffer(id: string): Promise<void> {
        return await this.offerService.deleteOffer(id);
    }
}
