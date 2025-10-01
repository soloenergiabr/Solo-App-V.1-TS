import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InverterService } from '../services/inverter.service';
import { InverterRepository } from '../repositories/inverter.repository';
import { InverterModel } from '../models/inverter.model';
import { UserContextModel } from '@/backend/auth/models/user-context.model';
import { ZodError } from 'zod';
import { InMemoryInverterRepository } from '../repositories/implementations/in-memory.inverter.repository';

// Mock the repository


describe('InverterService', () => {
    let inverterService: InverterService;
    let mockUserContext: UserContextModel;
    let inverterRepository: InverterRepository;
    beforeEach(() => {
        inverterRepository = new InMemoryInverterRepository();
        vi.spyOn(inverterRepository, 'create');
        vi.spyOn(inverterRepository, 'find');
        vi.spyOn(inverterRepository, 'findById');

        inverterService = new InverterService(inverterRepository);
        mockUserContext = new UserContextModel(
            'user123',
            'test@example.com',
            'Test User',
            ['user'],
            ['create_inverter', 'read_inverters'],
            'client123'
        );
        vi.clearAllMocks();
    });

    describe('createInverter', () => {
        it('should create an inverter successfully', async () => {
            const request = {
                name: 'Test Inverter',
                provider: 'solis' as const,
                providerId: 'SOL123',
                providerApiKey: 'key123',
            };


            const result = await inverterService.createInverter(request, mockUserContext);

            expect(result).toHaveProperty('inverterId');
            expect(typeof result.inverterId).toBe('string');
            expect(inverterRepository.create).toHaveBeenCalledOnce();
        });

        it('should validate required fields', async () => {
            const request = {
                name: '',
                provider: 'solis' as const,
                providerId: 'SOL123',
            };

            await expect(inverterService.createInverter(request, mockUserContext)).rejects.toThrow(ZodError);
        });

        it('should validate URL format for providerUrl', async () => {
            const request = {
                name: 'Test Inverter',
                provider: 'solis' as const,
                providerId: 'SOL123',
                providerUrl: 'invalid-url',
            };

            await expect(inverterService.createInverter(request, mockUserContext)).rejects.toThrow(ZodError);
        });

        it('should accept valid URL for providerUrl', async () => {
            const request = {
                name: 'Test Inverter',
                provider: 'solis' as const,
                providerId: 'SOL123',
                providerUrl: 'https://api.solis.com',
            };


            const result = await inverterService.createInverter(request, mockUserContext);

            expect(result).toHaveProperty('inverterId');
            expect(inverterRepository.create).toHaveBeenCalledOnce();
        });
    });

    describe('getInverters', () => {
        it('should return list of inverters', async () => {
            const mockInverters = [
                new InverterModel('inv1', 'Inverter 1', 'solis', 'SOL1', undefined, undefined, undefined, mockUserContext.clientId),
                new InverterModel('inv2', 'Inverter 2', 'solplanet', 'SP2', undefined, undefined, undefined, mockUserContext.clientId),
            ];

            await inverterRepository.create(mockInverters[0]);
            await inverterRepository.create(mockInverters[1]);

            const result = await inverterService.getInverters(mockUserContext);

            expect(result.inverters).toHaveLength(2);
            expect(result.inverters[0]).toMatchObject({
                id: 'inv1',
                name: 'Inverter 1',
                provider: 'solis' as const,
                providerId: 'SOL1',
            });
            expect(inverterRepository.find).toHaveBeenCalledOnce();
        });

        it('should return empty list when no inverters exist', async () => {
            const result = await inverterService.getInverters(mockUserContext);

            expect(result.inverters).toHaveLength(0);
            expect(inverterRepository.find).toHaveBeenCalledOnce();
        });
    });

    describe('getInverterById', () => {
        it('should return inverter by id', async () => {
            const mockInverter = new InverterModel('inv1', 'Inverter 1', 'solis', 'SOL1', undefined, undefined, undefined, mockUserContext.clientId);

            await inverterRepository.create(mockInverter);

            const result = await inverterService.getInverterById({ inverterId: 'inv1' }, mockUserContext);

            expect(result.inverter).toMatchObject({
                id: 'inv1',
                name: 'Inverter 1',
                provider: 'solis' as const,
                providerId: 'SOL1',
            });
            expect(inverterRepository.findById).toHaveBeenCalledWith('inv1');
        });

        it('should validate inverterId is provided', async () => {
            await expect(
                inverterService.getInverterById({ inverterId: '' }, mockUserContext)
            ).rejects.toThrow(ZodError);
        });

        it('should throw error when inverter not found', async () => {
            await expect(
                inverterService.getInverterById({ inverterId: 'nonexistent' }, mockUserContext)
            ).rejects.toThrow('Inverter not found');
        });
    });
});
