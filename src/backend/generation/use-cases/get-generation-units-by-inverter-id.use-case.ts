import { z } from "zod";
import { InverterRepository } from "../repositories/inverter.repository";
import { GenerationUnitRepository } from "../repositories/generation-unit.repository";
import { GenerationUnitModel, GenerationUnitType } from "../models/generation-unit.model";
import { UserContext } from "@/backend/auth/models/user-context.model";

// Request Schema
export const GetGenerationUnitsByInverterIdRequestSchema = z.object({
    inverterId: z.string().min(1, "Inverter ID is required"),
    type: z.enum(['real_time', 'day', 'month', 'year']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
});

// Response Schema
export const GetGenerationUnitsByInverterIdResponseSchema = z.object({
    generationUnits: z.array(z.object({
        id: z.string(),
        power: z.number(),
        energy: z.number(),
        generationUnitType: z.enum(['real_time', 'day', 'month', 'year']),
        inverterId: z.string(),
        timestamp: z.date(),
    })),
    count: z.number(),
});

// Types generated from schemas
export type GetGenerationUnitsByInverterIdRequest = z.infer<typeof GetGenerationUnitsByInverterIdRequestSchema>;
export type GetGenerationUnitsByInverterIdResponse = z.infer<typeof GetGenerationUnitsByInverterIdResponseSchema>;

export class GetGenerationUnitsByInverterIdUseCase {
    constructor(
        private inverterRepository: InverterRepository,
        private generationUnitRepository: GenerationUnitRepository
    ) { }

    async execute(request: GetGenerationUnitsByInverterIdRequest, userContext: UserContext): Promise<GetGenerationUnitsByInverterIdResponse> {
        // Validate input
        const validatedRequest = GetGenerationUnitsByInverterIdRequestSchema.parse(request);

        // Validate that the inverter exists
        await this.inverterRepository.findById(validatedRequest.inverterId);

        let generationUnits: GenerationUnitModel[];

        // Handle different query types
        if (validatedRequest.startDate && validatedRequest.endDate) {
            // Date range query
            if ('findByInverterIdAndDateRange' in this.generationUnitRepository) {
                generationUnits = await (this.generationUnitRepository as any).findByInverterIdAndDateRange(
                    validatedRequest.inverterId,
                    new Date(validatedRequest.startDate),
                    new Date(validatedRequest.endDate)
                );
            } else {
                // Fallback: filter in memory
                const allUnits = await this.generationUnitRepository.findByInverterId(validatedRequest.inverterId);
                const startDate = new Date(validatedRequest.startDate);
                const endDate = new Date(validatedRequest.endDate);
                generationUnits = allUnits.filter(unit =>
                    unit.timestamp >= startDate && unit.timestamp <= endDate
                );
            }
        } else if (validatedRequest.type) {
            // Type-specific query
            if ('findByInverterIdAndType' in this.generationUnitRepository) {
                generationUnits = await (this.generationUnitRepository as any).findByInverterIdAndType(
                    validatedRequest.inverterId,
                    validatedRequest.type
                );
            } else {
                // Fallback: filter in memory
                const allUnits = await this.generationUnitRepository.findByInverterId(validatedRequest.inverterId);
                generationUnits = allUnits.filter(unit => unit.generationUnitType === validatedRequest.type);
            }
        } else {
            // Get all generation units for the inverter
            generationUnits = await this.generationUnitRepository.findByInverterId(validatedRequest.inverterId);
        }

        return GetGenerationUnitsByInverterIdResponseSchema.parse({
            generationUnits: generationUnits.map(unit => ({
                id: unit.id,
                power: unit.power,
                energy: unit.energy,
                generationUnitType: unit.generationUnitType,
                inverterId: unit.inverterId,
                timestamp: unit.timestamp,
            })),
            count: generationUnits.length,
        });
    }
}
