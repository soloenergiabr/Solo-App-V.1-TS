import { TransactionRepository } from "../repositories/transaction.repository";
import { TransactionModel } from "../models/transaction.model";
import { UserContext } from '@/backend/auth/models/user-context.model';

export class TransactionService {
    constructor(
        private transactionRepository: TransactionRepository
    ) { }

    async createTransaction(transaction: TransactionModel): Promise<void> {
        await this.transactionRepository.create(transaction);
    }

    async getClientTransactions(userContext: UserContext): Promise<TransactionModel[]> {
        if (!userContext.clientId) {
            throw new Error('Client ID not found in user context');
        }
        return this.transactionRepository.findByClientId(userContext.clientId);
    }

    async getClientBalance(userContext: UserContext): Promise<number> {
        if (!userContext.clientId) {
            throw new Error('Client ID not found in user context');
        }
        return this.transactionRepository.getBalance(userContext.clientId);
    }

    async hasSufficientBalance(userContext: UserContext, amount: number): Promise<boolean> {
        const balance = await this.getClientBalance(userContext);
        return balance >= amount;
    }
}
