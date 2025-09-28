import { PrismaClient } from "@/app/generated/prisma";
import { InverterRepository } from "./inverter.repository";
import { GenerationUnitRepository } from "./generation-unit.repository";
import { PrismaInverterRepository } from "./implementations/prisma.inverter.repository";
import { PrismaGenerationUnitRepository } from "./implementations/prisma.generation-unit.repository";
import { InMemoryInverterRepository } from "./implementations/in-memory.inverter.repository";
import { InMemoryGenerationUnitRepository } from "./implementations/in-memory.generation-unit.repository";

export type RepositoryType = 'prisma' | 'in-memory';

export interface RepositoryFactory {
    createInverterRepository(): InverterRepository;
    createGenerationUnitRepository(): GenerationUnitRepository;
}

export class PrismaRepositoryFactory implements RepositoryFactory {
    constructor(private prisma: PrismaClient) { }

    createInverterRepository(): InverterRepository {
        return new PrismaInverterRepository(this.prisma);
    }

    createGenerationUnitRepository(): GenerationUnitRepository {
        return new PrismaGenerationUnitRepository(this.prisma);
    }
}

export class InMemoryRepositoryFactory implements RepositoryFactory {
    createInverterRepository(): InverterRepository {
        return new InMemoryInverterRepository();
    }

    createGenerationUnitRepository(): GenerationUnitRepository {
        return new InMemoryGenerationUnitRepository();
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
            case 'in-memory':
                this.instance = new InMemoryRepositoryFactory();
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
