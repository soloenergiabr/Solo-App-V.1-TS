import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateInverterUseCase, CreateInverterRequestSchema } from '../use-cases/create-inverter.use-case';
import { InverterRepository } from '../repositories/inverter.repository';
import { ZodError } from 'zod';
import { UserContextModel } from '@/backend/auth/models/user-context.model';

// Mock the repository
const mockInverterRepository: InverterRepository = {
    create: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
};

describe('CreateInverterUseCase', () => {
    let useCase: CreateInverterUseCase;
    let mockUserContext: UserContextModel;

    beforeEach(() => {
        useCase = new CreateInverterUseCase(mockInverterRepository);
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

    describe('execute', () => {
        it('should create an inverter successfully', async () => {
            vi.mocked(mockInverterRepository.create).mockResolvedValue();

            const request = {
                name: 'Test Inverter',
                provider: 'solis' as const,
                providerId: 'SOL123',
                providerApiKey: 'key123',
                providerApiSecret: 'secret123',
                providerUrl: 'https://api.solis.com',
            };

            const result = await useCase.execute(request, mockUserContext);

            expect(result).toHaveProperty('inverterId');
            expect(typeof result.inverterId).toBe('string');
            expect(result.inverterId).toMatch(/^inverter_/);
            expect(mockInverterRepository.create).toHaveBeenCalledOnce();

            const createdInverter = vi.mocked(mockInverterRepository.create).mock.calls[0][0];
            expect(createdInverter.name).toBe('Test Inverter');
            expect(createdInverter.provider).toBe('solis');
            expect(createdInverter.providerId).toBe('SOL123');
            expect(createdInverter.providerApiKey).toBe('key123');
            expect(createdInverter.providerApiSecret).toBe('secret123');
            expect(createdInverter.providerUrl).toBe('https://api.solis.com');
        });

        it('should create an inverter with minimal required fields', async () => {
            vi.mocked(mockInverterRepository.create).mockResolvedValue();

            const request = {
                name: 'Minimal Inverter',
                provider: 'solis' as const,
                providerId: 'SOL456',
            };

            const result = await useCase.execute(request, mockUserContext);

            expect(result).toHaveProperty('inverterId');
            expect(mockInverterRepository.create).toHaveBeenCalledOnce();

            const createdInverter = vi.mocked(mockInverterRepository.create).mock.calls[0][0];
            expect(createdInverter.name).toBe('Minimal Inverter');
            expect(createdInverter.provider).toBe('solis');
            expect(createdInverter.providerId).toBe('SOL456');
            expect(createdInverter.providerApiKey).toBeUndefined();
            expect(createdInverter.providerApiSecret).toBeUndefined();
            expect(createdInverter.providerUrl).toBeUndefined();
        });

        it('should throw ZodError for invalid input', async () => {
            const invalidRequest = {
                name: '', // Empty name should fail validation
                provider: 'solis' as const,
                providerId: 'SOL123',
            };

            await expect(useCase.execute(invalidRequest, mockUserContext)).rejects.toThrow(ZodError);
            expect(mockInverterRepository.create).not.toHaveBeenCalled();
        });

        it('should throw ZodError for invalid URL', async () => {
            const invalidRequest = {
                name: 'Test Inverter',
                provider: 'solis' as const,
                providerId: 'SOL123',
                providerUrl: 'not-a-valid-url',
            };

            await expect(useCase.execute(invalidRequest, mockUserContext)).rejects.toThrow(ZodError);
            expect(mockInverterRepository.create).not.toHaveBeenCalled();
        });

        it('should throw ZodError for name too long', async () => {
            const invalidRequest = {
                name: 'A'.repeat(101), // Name longer than 100 characters
                provider: 'solis' as const,
                providerId: 'SOL123',
            };

            await expect(useCase.execute(invalidRequest, mockUserContext)).rejects.toThrow(ZodError);
            expect(mockInverterRepository.create).not.toHaveBeenCalled();
        });

        it('should propagate repository errors', async () => {
            vi.mocked(mockInverterRepository.create).mockRejectedValue(
                new Error('Database connection failed')
            );

            const request = {
                name: 'Test Inverter',
                provider: 'solis' as const,
                providerId: 'SOL123',
            };

            await expect(useCase.execute(request, mockUserContext)).rejects.toThrow('Database connection failed');
        });
    });

    describe('CreateInverterRequestSchema', () => {
        it('should validate valid request', () => {
            const validRequest = {
                name: 'Test Inverter',
                provider: 'solis',
                providerId: 'SOL123',
                providerApiKey: 'key123',
                providerApiSecret: 'secret123',
                providerUrl: 'https://api.solis.com',
            };

            const result = CreateInverterRequestSchema.safeParse(validRequest);
            expect(result.success).toBe(true);
        });

        it('should reject empty name', () => {
            const invalidRequest = {
                name: '',
                provider: 'solis',
                providerId: 'SOL123',
            };

            const result = CreateInverterRequestSchema.safeParse(invalidRequest);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Name is required');
            }
        });

        it('should reject invalid URL', () => {
            const invalidRequest = {
                name: 'Test Inverter',
                provider: 'solis',
                providerId: 'SOL123',
                providerUrl: 'invalid-url',
            };

            const result = CreateInverterRequestSchema.safeParse(invalidRequest);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Invalid URL format');
            }
        });

        it('should allow optional fields to be undefined', () => {
            const validRequest = {
                name: 'Test Inverter',
                provider: 'solis',
                providerId: 'SOL123',
            };

            const result = CreateInverterRequestSchema.safeParse(validRequest);
            expect(result.success).toBe(true);
        });
    });
});
