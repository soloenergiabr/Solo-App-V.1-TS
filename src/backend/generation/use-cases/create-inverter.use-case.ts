import { z } from "zod";
import { InverterRepository } from "../repositories/inverter.repository";
import { InverterModel } from "../models/inverter.model";
import { UserContext } from '@/backend/auth/models/user-context.model';

// Request Schema
export const CreateInverterRequestSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
    provider: z.enum(['solis', 'solplanet', 'growatt', 'other']),
    providerId: z.string().min(1, 'Provider ID is required'),
    providerApiKey: z.string().optional(),
    providerApiSecret: z.string().optional(),
    providerUrl: z.string().url('Invalid URL format').optional(),
});

// Response Schema
export const CreateInverterResponseSchema = z.object({
    inverterId: z.string(),
});

// Types generated from schemas
export type CreateInverterRequest = z.infer<typeof CreateInverterRequestSchema>;
export type CreateInverterResponse = z.infer<typeof CreateInverterResponseSchema>;

export class CreateInverterUseCase {
    constructor(
        private inverterRepository: InverterRepository
    ) { }

    async execute(request: CreateInverterRequest, userContext: UserContext): Promise<CreateInverterResponse> {
        // Validar entrada
        const validatedRequest = CreateInverterRequestSchema.parse(request);

        // Verificar permissões
        if (!userContext.hasPermission('create_inverter')) {
            throw new Error('User does not have permission to create inverters');
        }

        // Criar o inversor
        const inverterId = `inverter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const inverter = new InverterModel(
            inverterId,
            validatedRequest.name,
            validatedRequest.provider,
            validatedRequest.providerId,
            validatedRequest.providerApiKey,
            validatedRequest.providerApiSecret,
            validatedRequest.providerUrl,
            userContext.clientId // Associar ao cliente do usuário
        );

        // await this.inverterRepository.create(inverter);

        return CreateInverterResponseSchema.parse({
            inverterId,
        });
    }
}
