import { z } from "zod";
import { OfferRepository } from "../repositories/offer.repository";
import { TransactionRepository } from "../repositories/transaction.repository";
import { TransactionModel } from "../models/transaction.model";
import { UserContext } from "@/backend/auth/models/user-context.model";

// Request Schema
export const RedeemOfferRequestSchema = z.object({
    offerId: z.string().min(1, "Offer ID is required"),
});

// Response Schema
export const RedeemOfferResponseSchema = z.object({
    transactionId: z.string(),
    newBalance: z.number(),
});

// Types generated from schemas
export type RedeemOfferRequest = z.infer<typeof RedeemOfferRequestSchema>;
export type RedeemOfferResponse = z.infer<typeof RedeemOfferResponseSchema>;

export class RedeemOfferUseCase {
    constructor(
        private offerRepository: OfferRepository,
        private transactionRepository: TransactionRepository
    ) { }

    async execute(request: RedeemOfferRequest, userContext: UserContext): Promise<RedeemOfferResponse> {
        // Validate input
        const validatedRequest = RedeemOfferRequestSchema.parse(request);

        // Verificar permissões
        if (!userContext.hasPermission('redeem_offers')) {
            throw new Error('User does not have permission to redeem offers');
        }

        // Get client ID from user context
        const clientId = userContext.clientId;
        if (!clientId) {
            throw new Error('Client ID not found in user context');
        }

        // Find the offer
        const offer = await this.offerRepository.findById(validatedRequest.offerId);
        if (!offer) {
            throw new Error("Offer not found");
        }

        if (!offer.isActive) {
            throw new Error("Offer is not active");
        }

        // Check validity dates
        const now = new Date();
        if (offer.validFrom && now < offer.validFrom) {
            throw new Error("Offer is not yet valid");
        }
        if (offer.validTo && now > offer.validTo) {
            throw new Error("Offer has expired");
        }

        // Check balance
        const currentBalance = await this.transactionRepository.getBalance(clientId);
        if (currentBalance < offer.cost) {
            throw new Error("Insufficient solo coin balance");
        }

        // Create transaction
        const transaction = new TransactionModel({
            clientId,
            type: 'offer_redemption',
            amount: -offer.cost,
            description: `Redemption of offer: ${offer.title}`,
            offerId: offer.id,
        });

        await this.transactionRepository.create(transaction);

        // Get new balance
        const newBalance = await this.transactionRepository.getBalance(clientId);

        return RedeemOfferResponseSchema.parse({
            transactionId: transaction.id,
            newBalance,
        });
    }
}
