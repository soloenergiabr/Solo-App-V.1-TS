import { z } from "zod";
import { InverterRepository } from "../repositories/inverter.repository";
import { GenerationUnitRepository } from "../repositories/generation-unit.repository";
import { UserContext } from '@/backend/auth/models/user-context.model';
import { GenerationUnitModel } from "../models/generation-unit.model";

// Request Schema
export const CalculateTotalEnergyGeneratedRequestSchema = z.object({
    inverterId: z.string().min(1, "Inverter ID is required"),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
});

// Response Schema
export const CalculateTotalEnergyGeneratedResponseSchema = z.object({
    totalEnergy: z.number(),
    inverterId: z.string(),
    period: z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
    }),
    unitCount: z.number(),
});

// Types generated from schemas
export type CalculateTotalEnergyGeneratedRequest = z.infer<typeof CalculateTotalEnergyGeneratedRequestSchema>;
export type CalculateTotalEnergyGeneratedResponse = z.infer<typeof CalculateTotalEnergyGeneratedResponseSchema>;

export class CalculateTotalEnergyGeneratedUseCase {
    constructor(
        private inverterRepository: InverterRepository,
        private generationUnitRepository: GenerationUnitRepository
    ) { }

    async execute(request: CalculateTotalEnergyGeneratedRequest, userContext: UserContext): Promise<CalculateTotalEnergyGeneratedResponse> {
        // Validate input
        const validatedRequest = CalculateTotalEnergyGeneratedRequestSchema.parse(request);

        // Verificar permissões
        if (!userContext.hasPermission('read_generation_data')) {
            throw new Error('User does not have permission to read generation data');
        }

        // Validate that the inverter exists and user has access
        const inverter = await this.inverterRepository.findById(validatedRequest.inverterId);

        // Verificar acesso ao inversor
        if (!userContext.hasRole('admin') &&
            userContext.clientId &&
            inverter.clientId !== userContext.clientId) {
            throw new Error('User does not have access to this inverter');
        }

        let generationUnits: GenerationUnitModel[];

        if (validatedRequest.startDate && validatedRequest.endDate) {
            const allUnits = await this.generationUnitRepository.findByInverterId(validatedRequest.inverterId);
            const startDate = new Date(validatedRequest.startDate);
            const endDate = new Date(validatedRequest.endDate);
            generationUnits = allUnits.filter(unit =>
                unit.timestamp >= startDate && unit.timestamp <= endDate
            );
        } else {
            generationUnits = await this.generationUnitRepository.findByInverterId(validatedRequest.inverterId);
        }

        const totalEnergy = generationUnits.reduce((total, unit) => total + unit.energy, 0);

        return CalculateTotalEnergyGeneratedResponseSchema.parse({
            totalEnergy,
            inverterId: validatedRequest.inverterId,
            period: {
                startDate: validatedRequest.startDate,
                endDate: validatedRequest.endDate,
            },
            unitCount: generationUnits.length,
        });
    }
}
