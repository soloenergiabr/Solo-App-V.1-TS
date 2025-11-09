import { TransactionModel } from "../models/transaction.model"

export interface TransactionRepository {
    create(transaction: TransactionModel): Promise<void>
    findByClientId(clientId: string): Promise<TransactionModel[]>
    findById(id: string): Promise<TransactionModel | null>
    getBalance(clientId: string): Promise<number>
}
