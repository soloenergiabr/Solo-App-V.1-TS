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

export const initializeGenerationDIContainer = (repositoryType: RepositoryType = 'prisma', prisma?: PrismaClient): DIContainer => {
    if (!containerInstance) {
        containerInstance = new GenerationDIContainer(repositoryType, prisma);
    }
    return containerInstance;
};

export const getGenerationDIContainer = (): DIContainer => {
    if (!containerInstance) {
        throw new Error('Generation DI Container not initialized. Call initializeGenerationDIContainer() first.');
    }
    return containerInstance;
};

export const resetGenerationDIContainer = (): void => {
    containerInstance = null;
    RepositoryFactoryProvider.reset();
};
