import { z } from "zod";
import { InverterRepository } from "../repositories/inverter.repository";
import { InverterModel } from "../models/inverter.model";
import { UserContext } from '@/backend/auth/models/user-context.model';

// Request Schema (optional filters)
export const GetInvertersRequestSchema = z.object({
    provider: z.string().optional(),
    clientId: z.string().optional(),
}).optional();

// Response Schema
export const GetInvertersResponseSchema = z.object({
    inverters: z.array(z.object({
        id: z.string(),
        name: z.string(),
        provider: z.string(),
        providerId: z.string(),
        providerApiKey: z.string().optional(),
        providerApiSecret: z.string().optional(),
        providerUrl: z.string().optional(),
    })),
});

// Types generated from schemas
export type GetInvertersRequest = z.infer<typeof GetInvertersRequestSchema>;
export type GetInvertersResponse = z.infer<typeof GetInvertersResponseSchema>;

export class GetInvertersUseCase {
    constructor(
        private inverterRepository: InverterRepository
    ) { }

    async execute(userContext: UserContext, request?: GetInvertersRequest): Promise<GetInvertersResponse> {
        // Verificar permissões
        if (!userContext.hasPermission('read_inverters')) {
            throw new Error('User does not have permission to read inverters');
        }

        // Get all inverters from repository
        const inverters = await this.inverterRepository.find();

        // Apply user context filters (organization-based access)
        let filteredInverters = inverters;

        // Filter by user's client if not admin
        if (userContext.clientId && !userContext.hasRole('admin')) {
            filteredInverters = filteredInverters.filter(
                inverter => inverter.clientId === userContext.clientId
            );
        }

        // Apply additional filters if provided
        if (request?.provider) {
            filteredInverters = filteredInverters.filter(
                inverter => inverter.provider === request.provider
            );
        }

        if (request?.clientId) {
            // Only allow filtering by client if user has permission
            if (userContext.hasRole('admin') || userContext.clientId === request.clientId) {
                filteredInverters = filteredInverters.filter(
                    inverter => inverter.clientId === request.clientId
                );
            }
        }

        // Transform to response format
        const responseData = filteredInverters.map(inverter => ({
            id: inverter.id,
            name: inverter.name,
            provider: inverter.provider,
            providerId: inverter.providerId,
            providerApiKey: inverter.providerApiKey,
            providerApiSecret: inverter.providerApiSecret,
            providerUrl: inverter.providerUrl,
        }));

        return GetInvertersResponseSchema.parse({
            inverters: responseData,
        });
    }
}
