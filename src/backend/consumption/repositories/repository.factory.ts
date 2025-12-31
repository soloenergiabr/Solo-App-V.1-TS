import { PrismaClient } from "@/app/generated/prisma";
import { ConsumptionRepository } from "./consumption.repository";
import { PrismaConsumptionRepository } from "./implementations/prisma.consumption.repository";

export type RepositoryType = 'prisma';

export interface RepositoryFactory {
    createConsumptionRepository(): ConsumptionRepository;
}

export class PrismaRepositoryFactory implements RepositoryFactory {
    constructor(private prisma: PrismaClient) { }

    createConsumptionRepository(): ConsumptionRepository {
        return new PrismaConsumptionRepository(this.prisma);
    }
}

export class RepositoryFactoryProvider {
    private static instance: RepositoryFactory;

    static initialize(type: RepositoryType, prisma?: PrismaClient): void {
        switch (type) {
            case 'prisma':
                if (!prisma) {
                    throw new Error('PrismaClient is required for prisma repository type');
                }
                this.instance = new PrismaRepositoryFactory(prisma);
                break;
            default:
                throw new Error(`Unsupported repository type: ${type}`);
        }
    }

    static getInstance(): RepositoryFactory {
        if (!this.instance) {
            throw new Error('RepositoryFactory not initialized. Call initialize() first.');
        }
        return this.instance;
    }

    static reset(): void {
        this.instance = undefined as any;
    }
}
