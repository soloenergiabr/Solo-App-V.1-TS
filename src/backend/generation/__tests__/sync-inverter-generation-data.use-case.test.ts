import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { InverterApiRepository } from '../repositories/inverter-api.repository';
import { InverterApiFactory } from '../repositories/inverter-api.factory';
import { SyncInverterGenerationDataUseCase } from '../use-cases/sync-inverter-generation-data.use-case';
import { InverterRepository } from '../repositories/inverter.repository';
import { InMemoryInverterRepository } from '../repositories/implementations/in-memory.inverter.repository';
import { GenerationUnitRepository } from '../repositories/generation-unit.repository';
import { InMemoryGenerationUnitRepository } from '../repositories/implementations/in-memory.generation-unit.repository';
import { UserContextModel } from '@/backend/auth/models/user-context.model';

const inverterRepository: InverterRepository = new InMemoryInverterRepository()
const generationUnitRepository: GenerationUnitRepository = new InMemoryGenerationUnitRepository()

describe('Sync Inverter Generation Data Use Case', () => {
    let mockUserContext: UserContextModel;

    beforeAll(async () => {
        await inverterRepository.create({
            id: '1',
            name: 'My inverter',
            provider: 'mock',
            providerId: '1',
            providerApiKey: '1',
            providerApiSecret: '1',
            providerUrl: '1',
        })
    })

    beforeEach(async () => {
        await generationUnitRepository.deleteAll()

        mockUserContext = new UserContextModel(
            'user123',
            'test@example.com',
            'Test User',
            ['user'],
            ['create_inverter', 'read_inverters'],
            'client123'
        );
    })

    it('should sync inverter generation data', async () => {
        const syncInverterGenerationDataUseCase = new SyncInverterGenerationDataUseCase(inverterRepository, generationUnitRepository)
        await expect(syncInverterGenerationDataUseCase.execute({ inverterId: '1' }, mockUserContext)).resolves.not.toThrow()
        await expect(generationUnitRepository.findByInverterId('1')).resolves.toHaveLength(4)
    })

    it('should sync inverter generation data if already has day generation', async () => {
        await generationUnitRepository.create({
            id: '1',
            power: 1,
            energy: 1,
            generationUnitType: 'day',
            inverterId: '1',
            timestamp: new Date()
        })

        const syncInverterGenerationDataUseCase = new SyncInverterGenerationDataUseCase(inverterRepository, generationUnitRepository)
        await expect(syncInverterGenerationDataUseCase.execute({ inverterId: '1' }, mockUserContext)).resolves.not.toThrow()
        await expect(generationUnitRepository.findByInverterId('1')).resolves.toHaveLength(4)
    })

    it('should not sync inverter generation data if inverter not found', async () => {
        const syncInverterGenerationDataUseCase = new SyncInverterGenerationDataUseCase(inverterRepository, generationUnitRepository)
        await expect(syncInverterGenerationDataUseCase.execute({ inverterId: '2' }, mockUserContext)).rejects.toThrow()
    })
})
