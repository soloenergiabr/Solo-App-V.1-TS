import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GenerationService } from '../services/generation.service';
import { InverterRepository } from '../repositories/inverter.repository';
import { GenerationUnitRepository } from '../repositories/generation-unit.repository';
import { InverterModel } from '../models/inverter.model';
import { GenerationUnitModel } from '../models/generation-unit.model';
import { UserContextModel } from '@/backend/auth/models/user-context.model';
import { InMemoryInverterRepository } from '../repositories/implementations/in-memory.inverter.repository';
import { InMemoryGenerationUnitRepository } from '../repositories/implementations/in-memory.generation-unit.repository';

// Mock the repositories

describe('GenerationService', () => {
    let service: GenerationService;
    let mockUserContext: UserContextModel;
    let inverterRepository: InverterRepository
    let generationUnitRepository: GenerationUnitRepository


    beforeEach(() => {
        inverterRepository = new InMemoryInverterRepository()
        generationUnitRepository = new InMemoryGenerationUnitRepository()
        service = new GenerationService(
            inverterRepository,
            generationUnitRepository
        );
        mockUserContext = new UserContextModel(
            'user123',
            'test@example.com',
            'Test User',
            ['user', 'master'],
            ['create_inverter', 'read_inverters', 'read_generation_data'],
            'client123'
        );


        vi.spyOn(inverterRepository, 'create')
        vi.spyOn(inverterRepository, 'find')
        vi.spyOn(inverterRepository, 'findById')

        vi.spyOn(generationUnitRepository, 'create')
        vi.spyOn(generationUnitRepository, 'findByInverterId')

        vi.clearAllMocks();
    });

    describe('createInverter', () => {
        it('should delegate to InverterService', async () => {

            const request = {
                name: 'Test Inverter',
                provider: 'solis' as const,
                providerId: 'SOL123',
            };

            const result = await service.createInverter(request, mockUserContext);

            expect(result).toHaveProperty('inverterId');
            expect(inverterRepository.create).toHaveBeenCalledOnce();
        });
    });

    describe('getCompleteInverterAnalytics', () => {
        it('should return complete analytics for an inverter', async () => {
            const mockInverter = new InverterModel('inv1', 'Test Inverter', 'mock', 'SOL1', undefined, undefined, undefined, mockUserContext.clientId);
            const mockUnits = [
                new GenerationUnitModel({
                    id: 'unit1',
                    power: 5000,
                    energy: 1200,
                    generationUnitType: 'real_time',
                    inverterId: 'inv1',
                }),
                new GenerationUnitModel({
                    id: 'unit2',
                    power: 4800,
                    energy: 1150,
                    generationUnitType: 'day',
                    inverterId: 'inv1',
                }),
            ];

            await inverterRepository.create(mockInverter);
            await generationUnitRepository.create(mockUnits[0]);
            await generationUnitRepository.create(mockUnits[1]);

            const result = await service.getCompleteInverterAnalytics({ inverterId: 'inv1', userContext: mockUserContext });

            expect(result).toHaveProperty('inverter');
            expect(result).toHaveProperty('generationUnits');
            expect(result).toHaveProperty('totalEnergy');
            expect(result).toHaveProperty('latestData');
            expect(result).toHaveProperty('summary');

            // Type guard para analytics de um único inversor
            if ('inverter' in result) {
                expect(result.inverter.id).toBe('inv1');
                expect(result.generationUnits).toHaveLength(2);
                expect(result.totalEnergy).toBe(2350); // 1200 + 1150
                expect(result.summary.totalUnits).toBe(2);
            }
        });

        it('should handle date range filtering', async () => {
            const mockInverter = new InverterModel('inv1', 'Test Inverter', 'solis', 'SOL1', undefined, undefined, undefined, mockUserContext.clientId);
            const mockUnits = [
                new GenerationUnitModel({
                    power: 5000,
                    energy: 1200,
                    generationUnitType: 'real_time',
                    inverterId: 'inv1',
                }),
            ];

            await inverterRepository.create(mockInverter);
            await generationUnitRepository.create(mockUnits[0]);

            const startDate = '2024-01-01T00:00:00Z';
            const endDate = '2024-01-31T23:59:59Z';

            const result = await service.getCompleteInverterAnalytics({ inverterId: 'inv1', userContext: mockUserContext, startDate, endDate });

            expect(result.summary.period.startDate).toBe(startDate);
            expect(result.summary.period.endDate).toBe(endDate);
        });

        it('should return analytics for all client inverters when inverterId is not provided', async () => {
            const mockInverter1 = new InverterModel('inv1', 'Inverter 1', 'solis', 'SOL1', undefined, undefined, undefined, mockUserContext.clientId);
            const mockInverter2 = new InverterModel('inv2', 'Inverter 2', 'growatt', 'GRO1', undefined, undefined, undefined, mockUserContext.clientId);
            
            const mockUnits1 = [
                new GenerationUnitModel({
                    id: 'unit1',
                    power: 5000,
                    energy: 1200,
                    generationUnitType: 'real_time',
                    inverterId: 'inv1',
                }),
            ];

            const mockUnits2 = [
                new GenerationUnitModel({
                    id: 'unit2',
                    power: 3000,
                    energy: 800,
                    generationUnitType: 'real_time',
                    inverterId: 'inv2',
                }),
            ];

            await inverterRepository.create(mockInverter1);
            await inverterRepository.create(mockInverter2);
            await generationUnitRepository.create(mockUnits1[0]);
            await generationUnitRepository.create(mockUnits2[0]);

            const result = await service.getCompleteInverterAnalytics({ userContext: mockUserContext });

            expect(result).toHaveProperty('inverters');
            expect(result).toHaveProperty('totalEnergy');
            expect(result).toHaveProperty('totalPower');
            expect(result).toHaveProperty('summary');
            expect(result).toHaveProperty('byInverter');

            // Type guard para analytics de todos os inversores
            if ('inverters' in result) {
                expect(result.inverters).toHaveLength(2);
                expect(result.totalEnergy).toBe(2000); // 1200 + 800
                expect(result.totalPower).toBe(8000); // 5000 + 3000
                expect(result.summary.totalInverters).toBe(2);
                expect(result.summary.totalUnits).toBe(2);
                expect(result.byInverter).toHaveLength(2);
            }
        });
    });

    describe('syncAllInvertersData', () => {
        it('should sync data for all inverters', async () => {
            const mockInverters = [
                new InverterModel('inv1', 'Inverter 1', 'mock', 'SOL1', undefined, undefined, undefined, mockUserContext.clientId),
                new InverterModel('inv2', 'Inverter 2', 'mock', 'SP2', undefined, undefined, undefined, mockUserContext.clientId),
            ];

            await inverterRepository.create(mockInverters[0]);
            await inverterRepository.create(mockInverters[1]);

            const result = await service.syncAllInvertersData(mockUserContext);

            expect(result.results).toHaveLength(2);
            expect(result.errors).toHaveLength(0);
            expect(result.results[0]).toHaveProperty('success', true);
            expect(result.results[0]).toHaveProperty('inverterId', 'inv1');
        });
    });

    describe('delegation methods', () => {
        it('should delegate getInverters to InverterService', async () => {
            const mockInverters = [
                new InverterModel('inv1', 'Inverter 1', 'solis', 'SOL1', undefined, undefined, undefined, mockUserContext.clientId),
            ];

            await inverterRepository.create(mockInverters[0]);

            const result = await service.getInverters(mockUserContext);

            expect(result.inverters).toHaveLength(1);
            expect(inverterRepository.find).toHaveBeenCalledOnce();
        });

        it('should delegate getInverterById to InverterService', async () => {
            const mockInverter = new InverterModel('inv1', 'Inverter 1', 'solis', 'SOL1', undefined, undefined, undefined, mockUserContext.clientId);

            await inverterRepository.create(mockInverter);

            const result = await service.getInverterById({ inverterId: 'inv1' }, mockUserContext);

            expect(result.inverter.id).toBe('inv1');
            expect(inverterRepository.findById).toHaveBeenCalledWith('inv1');
        });

        it('should delegate createGenerationUnit to GenerationAnalyticsService', async () => {
            const mockInverter = new InverterModel('inv1', 'Test Inverter', 'solis', 'SOL1', undefined, undefined, undefined, mockUserContext.clientId);

            await inverterRepository.create(mockInverter);

            const request = {
                power: 5000,
                energy: 1200,
                generationUnitType: 'real_time' as const,
                inverterId: 'inv1',
            };

            const result = await service.createGenerationUnit(request, mockUserContext);

            expect(result).toHaveProperty('generationUnitId');
            expect(generationUnitRepository.create).toHaveBeenCalledOnce();
        });
    });
});
