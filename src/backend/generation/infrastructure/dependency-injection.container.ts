import { PrismaClient } from "@/app/generated/prisma";
import { InverterRepository } from "../repositories/inverter.repository";
import { GenerationUnitRepository } from "../repositories/generation-unit.repository";
import { RepositoryFactory, RepositoryFactoryProvider, RepositoryType } from "../repositories/repository.factory";

export interface DIContainer {
    getInverterRepository(): InverterRepository;
    getGenerationUnitRepository(): GenerationUnitRepository;
    getRepositoryFactory(): RepositoryFactory;
}

export class GenerationDIContainer implements DIContainer {
    private repositoryFactory: RepositoryFactory;

    constructor(repositoryType: RepositoryType = 'prisma', prisma?: PrismaClient) {
        RepositoryFactoryProvider.initialize(repositoryType, prisma);
        this.repositoryFactory = RepositoryFactoryProvider.getInstance();
    }

    getInverterRepository(): InverterRepository {
        return this.repositoryFactory.createInverterRepository();
    }

    getGenerationUnitRepository(): GenerationUnitRepository {
        return this.repositoryFactory.createGenerationUnitRepository();
    }

    getRepositoryFactory(): RepositoryFactory {
        return this.repositoryFactory;
    }
}

// Singleton instance for the application
let containerInstance: DIContainer | null = null;

export const initializeDIContainer = (repositoryType: RepositoryType = 'prisma', prisma?: PrismaClient): DIContainer => {
    if (!containerInstance) {
        containerInstance = new GenerationDIContainer(repositoryType, prisma);
    }
    return containerInstance;
};

export const getDIContainer = (): DIContainer => {
    if (!containerInstance) {
        throw new Error('DI Container not initialized. Call initializeDIContainer() first.');
    }
    return containerInstance;
};

export const resetDIContainer = (): void => {
    containerInstance = null;
    RepositoryFactoryProvider.reset();
};
