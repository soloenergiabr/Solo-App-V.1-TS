import { z } from "zod";
import { InverterRepository } from "../repositories/inverter.repository";
import { InverterModel } from "../models/inverter.model";
import { UserContext } from '@/backend/auth/models/user-context.model';

// Request Schema (optional filters)
export const GetInvertersRequestSchema = z.object({
    provider: z.string().optional(),
    clientId: z.string().optional(),
}).optional();

// Response Schema (no credentials — redacted at the API boundary)
export const GetInvertersResponseSchema = z.object({
    inverters: z.array(z.object({
        id: z.string(),
        name: z.string(),
        provider: z.string(),
        providerId: z.string(),
        providerUrl: z.string().optional(),
        plantId: z.string().optional(),
        providerPlantId: z.string().optional(),
        providerPlantName: z.string().optional(),
        providerStatus: z.string().optional(),
        serialNumber: z.string().optional(),
        manufacturer: z.string().optional(),
        modelName: z.string().optional(),
        firmwareVersion: z.string().optional(),
        nominalPowerKw: z.number().optional(),
        timezone: z.string().optional(),
        syncEnabled: z.boolean(),
        syncIntervalMinutes: z.number().optional(),
        lastSyncAt: z.date().optional(),
        lastSuccessfulSyncAt: z.date().optional(),
        lastSyncStatus: z.string().optional(),
        lastSyncError: z.string().optional(),
        installedAt: z.date().optional(),
        commissionedAt: z.date().optional(),
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

        // Transform to response format (credentials redacted — never leak to frontend)
        const responseData = filteredInverters.map(inverter => ({
            id: inverter.id,
            name: inverter.name,
            provider: inverter.provider,
            providerId: inverter.providerId,
            // providerApiKey — redacted
            // providerApiSecret — redacted
            providerUrl: inverter.providerUrl,
            plantId: inverter.plantId,
            providerPlantId: inverter.providerPlantId,
            providerPlantName: inverter.providerPlantName,
            providerStatus: inverter.providerStatus,
            serialNumber: inverter.serialNumber,
            manufacturer: inverter.manufacturer,
            modelName: inverter.modelName,
            firmwareVersion: inverter.firmwareVersion,
            nominalPowerKw: inverter.nominalPowerKw,
            timezone: inverter.timezone,
            syncEnabled: inverter.syncEnabled,
            syncIntervalMinutes: inverter.syncIntervalMinutes,
            lastSyncAt: inverter.lastSyncAt,
            lastSuccessfulSyncAt: inverter.lastSuccessfulSyncAt,
            lastSyncStatus: inverter.lastSyncStatus,
            lastSyncError: inverter.lastSyncError,
            installedAt: inverter.installedAt,
            commissionedAt: inverter.commissionedAt,
        }));

        return GetInvertersResponseSchema.parse({
            inverters: responseData,
        });
    }
}
