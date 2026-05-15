import { z } from "zod";
import { InverterRepository } from "../repositories/inverter.repository";
import { InverterModel } from "../models/inverter.model";
import { UserContext } from '@/backend/auth/models/user-context.model';

// Request Schema
export const GetInverterByIdRequestSchema = z.object({
    inverterId: z.string().min(1, "Inverter ID is required"),
});

// Response Schema
export const GetInverterByIdResponseSchema = z.object({
    inverter: z.object({
        id: z.string(),
        name: z.string(),
        provider: z.string(),
        providerId: z.string(),
        providerApiKey: z.string().optional(),
        providerApiSecret: z.string().optional(),
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
        organizationId: z.string().optional(),
    }),
});

// Types generated from schemas
export type GetInverterByIdRequest = z.infer<typeof GetInverterByIdRequestSchema>;
export type GetInverterByIdResponse = z.infer<typeof GetInverterByIdResponseSchema>;

export class GetInverterByIdUseCase {
    constructor(
        private inverterRepository: InverterRepository
    ) { }

    async execute(request: GetInverterByIdRequest, userContext: UserContext): Promise<GetInverterByIdResponse> {
        // Validate input
        const validatedRequest = GetInverterByIdRequestSchema.parse(request);

        // Verificar permissões
        if (!userContext.hasPermission('read_inverters')) {
            throw new Error('User does not have permission to read inverters');
        }

        // Get inverter from repository
        const inverter = await this.inverterRepository.findById(validatedRequest.inverterId);

        // Verificar se o usuário pode acessar este inversor
        if (!userContext.canAccessInverter(inverter.id)) {
            // Verificar se pertence ao cliente do usuário (se não for admin)
            if (!userContext.hasRole('admin') &&
                userContext.clientId &&
                inverter.clientId !== userContext.clientId) {
                throw new Error('User does not have access to this inverter');
            }
        }

        // Transform to response format
        return GetInverterByIdResponseSchema.parse({
            inverter: {
                id: inverter.id,
                name: inverter.name,
                provider: inverter.provider,
                providerId: inverter.providerId,
                providerApiKey: inverter.providerApiKey,
                providerApiSecret: inverter.providerApiSecret,
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
                organizationId: inverter.clientId,
            },
        });
    }
}
