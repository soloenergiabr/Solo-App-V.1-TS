import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CalculateTotalEnergyGeneratedUseCase } from '../use-cases/calculate-total-energy-generated.use-case';
import { InverterRepository } from '../repositories/inverter.repository';
import { GenerationUnitRepository } from '../repositories/generation-unit.repository';
import { InverterModel } from '../models/inverter.model';
import { GenerationUnitModel } from '../models/generation-unit.model';
import { ZodError } from 'zod';
import { UserContextModel } from '@/backend/auth/models/user-context.model';
import { InMemoryInverterRepository } from '../repositories/implementations/in-memory.inverter.repository';
import { InMemoryGenerationUnitRepository } from '../repositories/implementations/in-memory.generation-unit.repository';

describe('CalculateTotalEnergyGeneratedUseCase', () => {
    let useCase: CalculateTotalEnergyGeneratedUseCase;
    let mockUserContext: UserContextModel;
    let inverterRepository: InverterRepository;
    let generationUnitRepository: GenerationUnitRepository;

    beforeEach(() => {
        inverterRepository = new InMemoryInverterRepository();
        generationUnitRepository = new InMemoryGenerationUnitRepository();

        useCase = new CalculateTotalEnergyGeneratedUseCase(
            inverterRepository,
            generationUnitRepository
        );
        mockUserContext = new UserContextModel(
            'user123',
            'test@example.com',
            'Test User',
            ['user'],
            ['create_inverter', 'read_inverters', 'read_generation_data'],
            'client123'
        );

        vi.spyOn(inverterRepository, "findById");
        vi.spyOn(generationUnitRepository, "findByInverterId");

        vi.clearAllMocks();
    });

    describe('execute', () => {
        it('should calculate total energy for all generation units', async () => {
            const mockInverter = new InverterModel('inv1', 'Test Inverter', 'solis', 'SOL1', undefined, undefined, undefined, 'client123');
            const mockUnits = [
                new GenerationUnitModel({
                    power: 5000,
                    energy: 1200,
                    generationUnitType: 'real_time',
                    inverterId: 'inv1',
                }),
                new GenerationUnitModel({
                    power: 4800,
                    energy: 1150,
                    generationUnitType: 'day',
                    inverterId: 'inv1',
                }),
                new GenerationUnitModel({
                    power: 4500,
                    energy: 1000,
                    generationUnitType: 'month',
                    inverterId: 'inv1',
                }),
            ];

            await inverterRepository.create(mockInverter);
            await generationUnitRepository.create(mockUnits[0]);
            await generationUnitRepository.create(mockUnits[1]);
            await generationUnitRepository.create(mockUnits[2]);

            const request = {
                inverterId: 'inv1',
            };

            const result = await useCase.execute(request, mockUserContext);

            expect(result.totalEnergy).toBe(3350); // 1200 + 1150 + 1000
            expect(result.inverterId).toBe('inv1');
            expect(result.unitCount).toBe(3);
            expect(result.period.startDate).toBeUndefined();
            expect(result.period.endDate).toBeUndefined();
            expect(inverterRepository.findById).toHaveBeenCalledWith('inv1');
            expect(generationUnitRepository.findByInverterId).toHaveBeenCalledWith('inv1');
        });

        it('should calculate total energy with date range filter', async () => {
            const mockInverter = new InverterModel('inv1', 'Test Inverter', 'solis', 'SOL1', undefined, undefined, undefined, mockUserContext.clientId);
            const startDate = '2024-01-01T00:00:00Z';
            const endDate = '2024-01-31T23:59:59Z';

            vi.useFakeTimers();
            vi.setSystemTime(new Date(startDate));

            const mockUnits = [
                new GenerationUnitModel({
                    power: 5000,
                    energy: 1200,
                    generationUnitType: 'day',
                    inverterId: 'inv1',
                }),
                new GenerationUnitModel({
                    power: 4800,
                    energy: 1150,
                    generationUnitType: 'day',
                    inverterId: 'inv1',
                }),
            ];

            await inverterRepository.create(mockInverter);
            await generationUnitRepository.create(mockUnits[0]);
            await generationUnitRepository.create(mockUnits[1]);


            const request = {
                inverterId: 'inv1',
                startDate,
                endDate,
            };

            const result = await useCase.execute(request, mockUserContext);

            expect(result.totalEnergy).toBe(2350); // 1200 + 1150
            expect(result.inverterId).toBe('inv1');
            expect(result.unitCount).toBe(2);
            expect(result.period.startDate).toBe(startDate);
            expect(result.period.endDate).toBe(endDate);
        });

        it('should fallback to in-memory filtering when repository does not support date range', async () => {
            const mockInverter = new InverterModel('inv1', 'Test Inverter', 'solis', 'SOL1', undefined, undefined, undefined, mockUserContext.clientId);
            const startDate = '2024-01-01T00:00:00Z';
            const endDate = '2024-01-31T23:59:59Z';

            const mockUnits = [
                new GenerationUnitModel({
                    power: 5000,
                    energy: 1200,
                    generationUnitType: 'day',
                    inverterId: 'inv1',
                }),
                new GenerationUnitModel({
                    power: 4800,
                    energy: 1150,
                    generationUnitType: 'day',
                    inverterId: 'inv1',
                }),
                new GenerationUnitModel({
                    power: 4500,
                    energy: 1000,
                    generationUnitType: 'day',
                    inverterId: 'inv1',
                }),
            ];

            // Set timestamps for filtering
            mockUnits[0].timestamp = new Date('2024-01-15T12:00:00Z'); // Within range
            mockUnits[1].timestamp = new Date('2024-01-20T12:00:00Z'); // Within range
            mockUnits[2].timestamp = new Date('2024-02-15T12:00:00Z'); // Outside range

            await inverterRepository.create(mockInverter);
            await generationUnitRepository.create(mockUnits[0]);
            await generationUnitRepository.create(mockUnits[1]);
            await generationUnitRepository.create(mockUnits[2]);

            const request = {
                inverterId: 'inv1',
                startDate,
                endDate,
            };

            const result = await useCase.execute(request, mockUserContext);

            expect(result.totalEnergy).toBe(2350); // Only first two units (1200 + 1150)
            expect(result.unitCount).toBe(2);
            expect(generationUnitRepository.findByInverterId).toHaveBeenCalledWith('inv1');
        });

        it('should return zero for inverter with no generation units', async () => {
            const mockInverter = new InverterModel('inv1', 'Test Inverter', 'solis', 'SOL1', undefined, undefined, undefined, mockUserContext.clientId);

            await inverterRepository.create(mockInverter);

            const request = {
                inverterId: 'inv1',
            };

            const result = await useCase.execute(request, mockUserContext);

            expect(result.totalEnergy).toBe(0);
            expect(result.unitCount).toBe(0);
            expect(result.inverterId).toBe('inv1');
        });

        it('should throw ZodError for invalid input', async () => {
            const invalidRequest = {
                inverterId: '', // Empty inverterId should fail validation
            };

            await expect(useCase.execute(invalidRequest, mockUserContext)).rejects.toThrow(ZodError);
            expect(inverterRepository.findById).not.toHaveBeenCalled();
        });

        it('should throw ZodError for invalid date format', async () => {
            const invalidRequest = {
                inverterId: 'inv1',
                startDate: 'invalid-date-format',
            };

            await expect(useCase.execute(invalidRequest, mockUserContext)).rejects.toThrow(ZodError);
            expect(inverterRepository.findById).not.toHaveBeenCalled();
        });

        it('should throw error when inverter not found', async () => {
            const request = {
                inverterId: 'nonexistent',
            };

            await expect(useCase.execute(request, mockUserContext)).rejects.toThrow('Inverter not found');
        });
    });
});
