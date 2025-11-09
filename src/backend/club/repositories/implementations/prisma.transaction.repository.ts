import { PrismaClient } from "@/app/generated/prisma";
import { TransactionModel, TransactionType } from "../../models/transaction.model";
import { TransactionRepository } from "../transaction.repository";

export class PrismaTransactionRepository implements TransactionRepository {
    constructor(private prisma: PrismaClient) { }

    async create(transaction: TransactionModel): Promise<void> {
        await this.prisma.transaction.create({
            data: {
                id: transaction.id,
                clientId: transaction.clientId,
                type: transaction.type,
                amount: transaction.amount,
                description: transaction.description,
                offerId: transaction.offerId,
                indicationId: transaction.indicationId,
                createdAt: transaction.createdAt,
            },
        });
    }

    async findByClientId(clientId: string): Promise<TransactionModel[]> {
        const transactions = await this.prisma.transaction.findMany({
            where: { clientId },
            orderBy: { createdAt: 'desc' },
        });

        return transactions.map(tx => new TransactionModel({
            id: tx.id,
            clientId: tx.clientId,
            type: tx.type as TransactionType,
            amount: tx.amount,
            description: tx.description || undefined,
            offerId: tx.offerId || undefined,
            indicationId: tx.indicationId || undefined,
            createdAt: tx.createdAt,
        }));
    }

    async findById(id: string): Promise<TransactionModel | null> {
        const tx = await this.prisma.transaction.findUnique({
            where: { id },
        });

        if (!tx) return null;

        return new TransactionModel({
            id: tx.id,
            clientId: tx.clientId,
            type: tx.type as TransactionType,
            amount: tx.amount,
            description: tx.description || undefined,
            offerId: tx.offerId || undefined,
            indicationId: tx.indicationId || undefined,
            createdAt: tx.createdAt,
        });
    }

    async getBalance(clientId: string): Promise<number> {
        const result = await this.prisma.transaction.aggregate({
            where: { clientId },
            _sum: { amount: true },
        });

        return result._sum.amount || 0;
    }
}
