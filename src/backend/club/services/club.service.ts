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

/**
 * Main orchestrator service that coordinates between specialized services
 * This service acts as a facade for the club domain
 */
export class ClubService {
    private indicationService: IndicationService;
    private transactionService: TransactionService;

    constructor(
        indicationRepository: IndicationRepository,
        transactionRepository: TransactionRepository
    ) {
        this.indicationService = new IndicationService(indicationRepository);
        this.transactionService = new TransactionService(transactionRepository);
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
}
