import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GenerationService } from '../services/generation.service';
import { InverterRepository } from '../repositories/inverter.repository';
import { GenerationUnitRepository } from '../repositories/generation-unit.repository';
import { InverterModel } from '../models/inverter.model';
import { GenerationUnitModel } from '../models/generation-unit.model';
import { UserContextModel } from '@/backend/auth/models/user-context.model';

// Mock the repositories
const mockInverterRepository: InverterRepository = {
    create: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
};

const mockGenerationUnitRepository: GenerationUnitRepository = {
    create: vi.fn(),
    findByInverterId: vi.fn(),
    update: vi.fn(),
    deleteAll: vi.fn(),
};

describe('GenerationService', () => {
    let service: GenerationService;
    let mockUserContext: UserContextModel;

    beforeEach(() => {
        service = new GenerationService(
            mockInverterRepository,
            mockGenerationUnitRepository
        );
        mockUserContext = new UserContextModel(
            'user123',
            'test@example.com',
            'Test User',
            ['user'],
            ['create_inverter', 'read_inverters', 'read_generation_data'],
            'client123'
        );
        vi.clearAllMocks();
    });

    describe('createInverter', () => {
        it('should delegate to InverterService', async () => {
            vi.mocked(mockInverterRepository.create).mockResolvedValue();

            const request = {
                name: 'Test Inverter',
                provider: 'solis' as const,
                providerId: 'SOL123',
            };

            const result = await service.createInverter(request, mockUserContext);

            expect(result).toHaveProperty('inverterId');
            expect(mockInverterRepository.create).toHaveBeenCalledOnce();
        });
    });

    describe('getCompleteInverterAnalytics', () => {
        it('should return complete analytics for an inverter', async () => {
            const mockInverter = new InverterModel('inv1', 'Test Inverter', 'solis', 'SOL1', undefined, undefined, undefined, mockUserContext.clientId);
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

            vi.mocked(mockInverterRepository.findById).mockResolvedValue(mockInverter);
            vi.mocked(mockGenerationUnitRepository.findByInverterId).mockResolvedValue(mockUnits);

            const result = await service.getCompleteInverterAnalytics('inv1', mockUserContext);

            expect(result).toHaveProperty('inverter');
            expect(result).toHaveProperty('generationUnits');
            expect(result).toHaveProperty('totalEnergy');
            expect(result).toHaveProperty('latestData');
            expect(result).toHaveProperty('summary');

            expect(result.inverter.id).toBe('inv1');
            expect(result.generationUnits).toHaveLength(2);
            expect(result.totalEnergy).toBe(2350); // 1200 + 1150
            expect(result.summary.totalUnits).toBe(2);
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

            vi.mocked(mockInverterRepository.findById).mockResolvedValue(mockInverter);
            vi.mocked(mockGenerationUnitRepository.findByInverterId).mockResolvedValue(mockUnits);

            const startDate = '2024-01-01T00:00:00Z';
            const endDate = '2024-01-31T23:59:59Z';

            const result = await service.getCompleteInverterAnalytics('inv1', mockUserContext, startDate, endDate);

            expect(result.summary.period.startDate).toBe(startDate);
            expect(result.summary.period.endDate).toBe(endDate);
        });
    });

    describe('syncAllInvertersData', () => {
        it('should sync data for all inverters', async () => {
            const mockInverters = [
                new InverterModel('inv1', 'Inverter 1', 'solis', 'SOL1', undefined, undefined, undefined, mockUserContext.clientId),
                new InverterModel('inv2', 'Inverter 2', 'solplanet', 'SP2', undefined, undefined, undefined, mockUserContext.clientId),
            ];

            vi.mocked(mockInverterRepository.find).mockResolvedValue(mockInverters);
            vi.mocked(mockInverterRepository.findById).mockResolvedValue(mockInverters[0]);
            vi.mocked(mockGenerationUnitRepository.findByInverterId).mockResolvedValue([]);

            // Mock the InverterApiFactory.create to avoid actual API calls
            vi.mock('../repositories/inverter-api.factory', () => ({
                InverterApiFactory: {
                    create: vi.fn().mockReturnValue({
                        getRealTimeGeneration: vi.fn().mockResolvedValue({
                            power: 5000,
                            energy: 1200,
                        }),
                    }),
                },
            }));

            const result = await service.syncAllInvertersData(mockUserContext);

            expect(result.results).toHaveLength(2);
            expect(result.errors).toHaveLength(0);
            expect(result.results[0]).toHaveProperty('success', true);
            expect(result.results[0]).toHaveProperty('inverterId', 'inv1');
        });

        it('should handle errors during sync', async () => {
            const mockInverters = [
                new InverterModel('inv1', 'Inverter 1', 'solis', 'SOL1', undefined, undefined, undefined, mockUserContext.clientId),
                new InverterModel('inv2', 'Inverter 2', 'solplanet', 'SP2', undefined, undefined, undefined, mockUserContext.clientId),
            ];

            vi.mocked(mockInverterRepository.find).mockResolvedValue(mockInverters);
            vi.mocked(mockInverterRepository.findById)
                .mockResolvedValueOnce(mockInverters[0])
                .mockRejectedValueOnce(new Error('Inverter not found'));

            vi.mocked(mockGenerationUnitRepository.findByInverterId).mockResolvedValue([]);

            // Mock the InverterApiFactory.create
            vi.mock('../repositories/inverter-api.factory', () => ({
                InverterApiFactory: {
                    create: vi.fn().mockReturnValue({
                        getRealTimeGeneration: vi.fn().mockResolvedValue({
                            power: 5000,
                            energy: 1200,
                        }),
                    }),
                },
            }));

            const result = await service.syncAllInvertersData(mockUserContext);

            expect(result.results).toHaveLength(1);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toMatchObject({
                inverterId: 'inv2',
                error: 'Inverter not found',
            });
        });
    });

    describe('delegation methods', () => {
        it('should delegate getInverters to InverterService', async () => {
            const mockInverters = [
                new InverterModel('inv1', 'Inverter 1', 'solis', 'SOL1', undefined, undefined, undefined, mockUserContext.clientId),
            ];

            vi.mocked(mockInverterRepository.find).mockResolvedValue(mockInverters);

            const result = await service.getInverters(mockUserContext);

            expect(result.inverters).toHaveLength(1);
            expect(mockInverterRepository.find).toHaveBeenCalledOnce();
        });

        it('should delegate getInverterById to InverterService', async () => {
            const mockInverter = new InverterModel('inv1', 'Inverter 1', 'solis', 'SOL1', undefined, undefined, undefined, mockUserContext.clientId);

            vi.mocked(mockInverterRepository.findById).mockResolvedValue(mockInverter);

            const result = await service.getInverterById({ inverterId: 'inv1' }, mockUserContext);

            expect(result.inverter.id).toBe('inv1');
            expect(mockInverterRepository.findById).toHaveBeenCalledWith('inv1');
        });

        it('should delegate createGenerationUnit to GenerationAnalyticsService', async () => {
            const mockInverter = new InverterModel('inv1', 'Test Inverter', 'solis', 'SOL1', undefined, undefined, undefined, mockUserContext.clientId);

            vi.mocked(mockInverterRepository.findById).mockResolvedValue(mockInverter);
            vi.mocked(mockGenerationUnitRepository.create).mockResolvedValue();

            const request = {
                power: 5000,
                energy: 1200,
                generationUnitType: 'real_time' as const,
                inverterId: 'inv1',
            };

            const result = await service.createGenerationUnit(request, mockUserContext);

            expect(result).toHaveProperty('generationUnitId');
            expect(mockGenerationUnitRepository.create).toHaveBeenCalledOnce();
        });
    });
});
