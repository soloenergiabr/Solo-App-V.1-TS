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
import { OfferRedemptionRepository } from "../repositories/offer-redemption.repository";
import { OfferRedemptionModel } from "../models/offer-redemption.model";
import { TransactionModel } from "../models/transaction.model";

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
        offerRepository: OfferRepository,
        private offerRedemptionRepository: OfferRedemptionRepository
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

    // Redemption operations
    async redeemOffer(offerId: string, userContext: UserContext): Promise<{ success: boolean; message: string; redemption?: OfferRedemptionModel }> {
        if (!userContext.clientId) {
            return { success: false, message: 'Cliente não encontrado' };
        }

        // Get offer
        const offer = await this.offerService.getOfferById(offerId);
        if (!offer) {
            return { success: false, message: 'Oferta não encontrada' };
        }

        if (!offer.isActive) {
            return { success: false, message: 'Oferta não está ativa' };
        }

        // Check balance
        const hasSufficientBalance = await this.transactionService.hasSufficientBalance(userContext, offer.cost);
        if (!hasSufficientBalance) {
            return { success: false, message: 'Saldo insuficiente de Solo Coins' };
        }

        // Create redemption
        const redemption = new OfferRedemptionModel({
            offerId,
            clientId: userContext.clientId,
            status: 'pending',
            expiresAt: offer.validTo || undefined,
        });

        const createdRedemption = await this.offerRedemptionRepository.create(redemption);

        // Debit Solo Coins
        const transaction = new TransactionModel({
            clientId: userContext.clientId,
            type: 'offer_redemption',
            amount: -offer.cost,
            description: `Resgate: ${offer.title}`,
            offerId: offer.id,
        });
        await this.transactionService.createTransaction(transaction);

        return {
            success: true,
            message: 'Oferta resgatada com sucesso!',
            redemption: createdRedemption
        };
    }

    async getClientRedemptions(userContext: UserContext): Promise<OfferRedemptionModel[]> {
        if (!userContext.clientId) {
            return [];
        }
        return await this.offerRedemptionRepository.findByClientId(userContext.clientId);
    }

    async getRedemptionById(id: string): Promise<OfferRedemptionModel | null> {
        return await this.offerRedemptionRepository.findById(id);
    }

    async confirmRedemptionUsage(redemptionId: string, confirmationCode: string): Promise<{ success: boolean; message: string }> {
        const redemption = await this.offerRedemptionRepository.findById(redemptionId);

        if (!redemption) {
            return { success: false, message: 'Voucher não encontrado' };
        }

        if (redemption.status === 'used') {
            return { success: false, message: 'Este voucher já foi utilizado' };
        }

        if (redemption.status === 'expired') {
            return { success: false, message: 'Este voucher expirou' };
        }

        // Get the offer to check confirmation code
        const offer = await this.offerService.getOfferById(redemption.offerId);
        if (!offer) {
            return { success: false, message: 'Oferta não encontrada' };
        }

        // Verify confirmation code
        if (!offer.confirmationCode) {
            return { success: false, message: 'Esta oferta não possui código de confirmação' };
        }

        if (offer.confirmationCode !== confirmationCode) {
            return { success: false, message: 'Código de confirmação inválido' };
        }

        // Mark as used
        redemption.status = 'used';
        redemption.usedAt = new Date();

        await this.offerRedemptionRepository.update(redemption);

        return { success: true, message: 'Voucher confirmado com sucesso!' };
    }

    // Partner validation using redemption code
    async validateRedemptionByCode(redemptionCode: string): Promise<{
        success: boolean;
        message: string;
        redemption?: OfferRedemptionModel
    }> {
        const redemption = await this.offerRedemptionRepository.findByRedemptionCode(redemptionCode.toUpperCase());

        if (!redemption) {
            return { success: false, message: 'Código de voucher inválido' };
        }

        if (redemption.status === 'used') {
            return { success: false, message: 'Este voucher já foi utilizado' };
        }

        if (redemption.status === 'expired') {
            return { success: false, message: 'Este voucher expirou' };
        }

        // Mark as used
        redemption.status = 'used';
        redemption.usedAt = new Date();

        await this.offerRedemptionRepository.update(redemption);

        return {
            success: true,
            message: 'Voucher validado com sucesso!',
            redemption
        };
    }
}
