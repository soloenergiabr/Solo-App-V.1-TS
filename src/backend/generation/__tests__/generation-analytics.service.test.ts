import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GenerationAnalyticsService } from '../services/generation-analytics.service';
import { InverterRepository } from '../repositories/inverter.repository';
import { GenerationUnitRepository } from '../repositories/generation-unit.repository';
import { InverterModel } from '../models/inverter.model';
import { GenerationUnitModel } from '../models/generation-unit.model';
import { ZodError } from 'zod';
import { UserContext, UserContextModel } from '@/backend/auth/models/user-context.model';

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

describe('GenerationAnalyticsService', () => {
    let service: GenerationAnalyticsService;
    let mockUserContext: UserContextModel;

    beforeEach(() => {
        service = new GenerationAnalyticsService(
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

    describe('createGenerationUnit', () => {
        it('should create a generation unit successfully', async () => {
            const mockInverter = new InverterModel('inv1', 'Test Inverter', 'solis', 'SOL1');
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
            expect(typeof result.generationUnitId).toBe('string');
            expect(mockInverterRepository.findById).toHaveBeenCalledWith('inv1');
            expect(mockGenerationUnitRepository.create).toHaveBeenCalledOnce();
        });

        it('should validate required fields', async () => {
            const request = {
                power: -100, // Invalid negative power
                energy: 1200,
                generationUnitType: 'real_time' as const,
                inverterId: 'inv1',
            };

            await expect(service.createGenerationUnit(request, mockUserContext)).rejects.toThrow(ZodError);
        });

        it('should validate generation unit type', async () => {
            const request = {
                power: 5000,
                energy: 1200,
                generationUnitType: 'invalid_type' as any,
                inverterId: 'inv1',
            };

            await expect(service.createGenerationUnit(request, mockUserContext)).rejects.toThrow(ZodError);
        });

        it('should throw error when inverter not found', async () => {
            vi.mocked(mockInverterRepository.findById).mockRejectedValue(
                new Error('Inverter not found')
            );

            const request = {
                power: 5000,
                energy: 1200,
                generationUnitType: 'real_time' as const,
                inverterId: 'nonexistent',
            };

            await expect(service.createGenerationUnit(request, mockUserContext)).rejects.toThrow('Inverter not found');
        });
    });

    describe('getGenerationUnitsByInverterId', () => {
        it('should return generation units for an inverter', async () => {
            const mockInverter = new InverterModel('inv1', 'Test Inverter', 'solis', 'SOL1');
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

            const result = await service.getGenerationUnitsByInverterId({
                inverterId: 'inv1',
            }, mockUserContext);

            expect(result.generationUnits).toHaveLength(2);
            expect(result.count).toBe(2);
            expect(result.generationUnits[0]).toMatchObject({
                id: 'unit1',
                power: 5000,
                energy: 1200,
                generationUnitType: 'real_time',
            });
        });

        it('should filter by type when provided', async () => {
            const mockInverter = new InverterModel('inv1', 'Test Inverter', 'solis', 'SOL1');
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
            ];

            vi.mocked(mockInverterRepository.findById).mockResolvedValue(mockInverter);
            vi.mocked(mockGenerationUnitRepository.findByInverterId).mockResolvedValue(mockUnits);

            const result = await service.getGenerationUnitsByInverterId({
                inverterId: 'inv1',
                type: 'real_time',
            }, mockUserContext);

            expect(result.generationUnits).toHaveLength(1);
            expect(result.generationUnits[0].generationUnitType).toBe('real_time');
        });
    });

    describe('calculateTotalEnergyGenerated', () => {
        it('should calculate total energy for an inverter', async () => {
            const mockInverter = new InverterModel('inv1', 'Test Inverter', 'solis', 'SOL1', undefined, undefined, undefined, mockUserContext.clientId);
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
            ];

            vi.mocked(mockInverterRepository.findById).mockResolvedValue(mockInverter);
            vi.mocked(mockGenerationUnitRepository.findByInverterId).mockResolvedValue(mockUnits);

            const result = await service.calculateTotalEnergyGenerated({
                inverterId: 'inv1',
            }, mockUserContext);

            expect(result.totalEnergy).toBe(2350); // 1200 + 1150
            expect(result.inverterId).toBe('inv1');
            expect(result.unitCount).toBe(2);
        });

        it('should return zero for inverter with no generation units', async () => {
            const mockInverter = new InverterModel('inv1', 'Test Inverter', 'solis', 'SOL1', undefined, undefined, undefined, mockUserContext.clientId);

            vi.mocked(mockInverterRepository.findById).mockResolvedValue(mockInverter);
            vi.mocked(mockGenerationUnitRepository.findByInverterId).mockResolvedValue([]);

            const result = await service.calculateTotalEnergyGenerated({
                inverterId: 'inv1',
            }, mockUserContext);

            expect(result.totalEnergy).toBe(0);
            expect(result.unitCount).toBe(0);
        });
    });

    describe('getLatestGenerationData', () => {
        it('should return latest generation data', async () => {
            const mockInverter = new InverterModel('inv1', 'Test Inverter', 'solis', 'SOL1', undefined, undefined, undefined, mockUserContext.clientId);
            const now = new Date();
            const earlier = new Date(now.getTime() - 60000); // 1 minute earlier

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
                    generationUnitType: 'real_time',
                    inverterId: 'inv1',
                }),
            ];

            // Set timestamps manually
            mockUnits[0].timestamp = now;
            mockUnits[1].timestamp = earlier;

            vi.mocked(mockInverterRepository.findById).mockResolvedValue(mockInverter);
            vi.mocked(mockGenerationUnitRepository.findByInverterId).mockResolvedValue(mockUnits);

            const result = await service.getLatestGenerationData({
                inverterId: 'inv1',
            }, mockUserContext);

            expect(result.latestData).not.toBeNull();
            expect(result.latestData?.id).toBe('unit1');
            expect(result.latestData?.power).toBe(5000);
        });

        it('should return null when no generation data exists', async () => {
            const mockInverter = new InverterModel('inv1', 'Test Inverter', 'solis', 'SOL1', undefined, undefined, undefined, mockUserContext.clientId);

            vi.mocked(mockInverterRepository.findById).mockResolvedValue(mockInverter);
            vi.mocked(mockGenerationUnitRepository.findByInverterId).mockResolvedValue([]);

            const result = await service.getLatestGenerationData({
                inverterId: 'inv1',
            }, mockUserContext);

            expect(result.latestData).toBeNull();
        });
    });
});
