import { PrismaClient } from "@/app/generated/prisma";
import { ConsumptionRepository } from "../repositories/consumption.repository";
import { RepositoryFactory, RepositoryFactoryProvider, RepositoryType } from "../repositories/repository.factory";

export interface DIContainer {
    getConsumptionRepository(): ConsumptionRepository;
    getRepositoryFactory(): RepositoryFactory;
}

export class ConsumptionDIContainer implements DIContainer {
    private repositoryFactory: RepositoryFactory;

    constructor(repositoryType: RepositoryType = 'prisma', prisma?: PrismaClient) {
        RepositoryFactoryProvider.initialize(repositoryType, prisma);
        this.repositoryFactory = RepositoryFactoryProvider.getInstance();
    }

    getConsumptionRepository(): ConsumptionRepository {
        return this.repositoryFactory.createConsumptionRepository();
    }

    getRepositoryFactory(): RepositoryFactory {
        return this.repositoryFactory;
    }
}

// Singleton instance
let containerInstance: DIContainer | null = null;

export const initializeConsumptionDIContainer = (repositoryType: RepositoryType = 'prisma', prisma?: PrismaClient): DIContainer => {
    if (!containerInstance) {
        containerInstance = new ConsumptionDIContainer(repositoryType, prisma);
    }
    return containerInstance;
};

export const getConsumptionDIContainer = (): DIContainer => {
    if (!containerInstance) {
        throw new Error('Consumption DI Container not initialized. Call initializeConsumptionDIContainer() first.');
    }
    return containerInstance;
};
