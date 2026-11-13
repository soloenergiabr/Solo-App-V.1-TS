import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest'
import { InverterApiRepository } from '../repositories/inverter-api.repository';
import { InverterApiFactory } from '../repositories/inverter-api.factory';
import { SyncInverterGenerationDataUseCase } from '../use-cases/sync-inverter-generation-data.use-case';
import { InverterRepository } from '../repositories/inverter.repository';
import { InMemoryInverterRepository } from '../repositories/implementations/in-memory.inverter.repository';
import { GenerationUnitRepository } from '../repositories/generation-unit.repository';
import { InMemoryGenerationUnitRepository } from '../repositories/implementations/in-memory.generation-unit.repository';
import { UserContextModel } from '@/backend/auth/models/user-context.model';
import { InverterModel } from '../models/inverter.model';

const inverterRepository: InverterRepository = new InMemoryInverterRepository()
const generationUnitRepository: GenerationUnitRepository = new InMemoryGenerationUnitRepository()

describe('Sync Inverter Generation Data Use Case', () => {
    let mockUserContext: UserContextModel;

    beforeAll(async () => {
        await inverterRepository.create(new InverterModel(
            '1',
            'My inverter',
            'mock',
            '1',
            '1',
            '1',
            '1'
        ))
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

        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-10-02T03:00:00.000Z'));

        await expect(syncInverterGenerationDataUseCase.execute({ inverterId: '1' })).resolves.not.toThrow()
        await expect(generationUnitRepository.findByInverterId('1')).resolves.toHaveLength(4)

        vi.setSystemTime(new Date('2025-10-02T04:00:00.000Z'));
        await expect(syncInverterGenerationDataUseCase.execute({ inverterId: '1' })).resolves.not.toThrow()
        await expect(generationUnitRepository.findByInverterId('1')).resolves.toHaveLength(5)

        vi.setSystemTime(new Date('2025-10-02T05:00:00.000Z'));
        await expect(syncInverterGenerationDataUseCase.execute({ inverterId: '1' })).resolves.not.toThrow()
        await expect(generationUnitRepository.findByInverterId('1')).resolves.toHaveLength(6)

        vi.setSystemTime(new Date('2025-11-02T06:00:00.000Z'));
        await expect(syncInverterGenerationDataUseCase.execute({ inverterId: '1' })).resolves.not.toThrow()
        await expect(generationUnitRepository.findByInverterId('1')).resolves.toHaveLength(9)
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
        await expect(syncInverterGenerationDataUseCase.execute({ inverterId: '1' })).resolves.not.toThrow()
        await expect(generationUnitRepository.findByInverterId('1')).resolves.toHaveLength(4)
    })

    it('should not sync inverter generation data if inverter not found', async () => {
        const syncInverterGenerationDataUseCase = new SyncInverterGenerationDataUseCase(inverterRepository, generationUnitRepository)
        await expect(syncInverterGenerationDataUseCase.execute({ inverterId: '2' })).rejects.toThrow()
    })

    it('não sobrescreve agregados mês/ano com zero quando o provedor não retorna dados', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-10-15T15:00:00.000Z'));
        const spy = vi.spyOn(InverterApiFactory, 'create').mockReturnValue({
            getRealTimeGeneration: async () => ({ power: 0, energy: 0 }),
        } as unknown as InverterApiRepository)

        await generationUnitRepository.create({ id: 'm', power: 0, energy: 500, generationUnitType: 'month', inverterId: '1', timestamp: new Date() })
        await generationUnitRepository.create({ id: 'y', power: 0, energy: 4000, generationUnitType: 'year', inverterId: '1', timestamp: new Date() })

        await new SyncInverterGenerationDataUseCase(inverterRepository, generationUnitRepository).execute({ inverterId: '1' })

        const units = await generationUnitRepository.findByInverterId('1')
        expect(units.find(u => u.generationUnitType === 'month')?.energy).toBe(500)
        expect(units.find(u => u.generationUnitType === 'year')?.energy).toBe(4000)
        spy.mockRestore()
        vi.useRealTimers()
    })
})
