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

describe('Solis Inverter Api Repository', () => {
    let mockUserContext: UserContextModel;

    beforeAll(async () => {
        await inverterRepository.create({
            id: '1',
            name: 'Valid Solis Inverter',
            provider: 'solis',
            providerId: '1308675217948935765',
            providerApiKey: '1300386381677169825',
            providerApiSecret: 'de360d20d66e4457b4dc581c99e271ad',
            providerUrl: 'https://www.soliscloud.com:13333',
        })
    })

    beforeEach(async () => {
        await generationUnitRepository.deleteAll()

        mockUserContext = new UserContextModel(
            'user123',
            'test@example.com',
            'Test User',
            ['user'],
            ['create_inverter', 'read_inverters', 'sync_inverter_generation_data'],
            'client123'
        );
    })

    it('should sync inverter generation data', async () => {
        const syncInverterGenerationDataUseCase = new SyncInverterGenerationDataUseCase(inverterRepository, generationUnitRepository)
        await expect(syncInverterGenerationDataUseCase.execute({ inverterId: '1' }, mockUserContext)).resolves.not.toThrow()
        await expect(generationUnitRepository.findByInverterId('1')).resolves.toHaveLength(4)
    })
})
