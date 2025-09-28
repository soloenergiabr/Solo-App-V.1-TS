import { z } from "zod";
import { InverterRepository } from "../repositories/inverter.repository";
import { GenerationUnitRepository } from "../repositories/generation-unit.repository";
import { GenerationUnitModel } from "../models/generation-unit.model";
import { UserContext } from '@/backend/auth/models/user-context.model';

// Request Schema
export const GetLatestGenerationDataRequestSchema = z.object({
    inverterId: z.string().min(1, "Inverter ID is required"),
});

// Response Schema
export const GetLatestGenerationDataResponseSchema = z.object({
    latestData: z.object({
        id: z.string(),
        power: z.number(),
        energy: z.number(),
        generationUnitType: z.enum(['real_time', 'day', 'month', 'year']),
        inverterId: z.string(),
        timestamp: z.date(),
    }).nullable(),
});

// Types generated from schemas
export type GetLatestGenerationDataRequest = z.infer<typeof GetLatestGenerationDataRequestSchema>;
export type GetLatestGenerationDataResponse = z.infer<typeof GetLatestGenerationDataResponseSchema>;

export class GetLatestGenerationDataUseCase {
    constructor(
        private inverterRepository: InverterRepository,
        private generationUnitRepository: GenerationUnitRepository
    ) { }

    async execute(request: GetLatestGenerationDataRequest, userContext: UserContext): Promise<GetLatestGenerationDataResponse> {
        // Validate input
        const validatedRequest = GetLatestGenerationDataRequestSchema.parse(request);

        // Validate that the inverter exists
        await this.inverterRepository.findById(validatedRequest.inverterId);

        let latestUnit = null;

        // Check if the repository has the optimized method
        if ('findLatestByInverterId' in this.generationUnitRepository) {
            latestUnit = await (this.generationUnitRepository as any).findLatestByInverterId(validatedRequest.inverterId);
        } else {
            // Fallback: get all and find the latest
            const allUnits = await this.generationUnitRepository.findByInverterId(validatedRequest.inverterId);
            if (allUnits.length > 0) {
                latestUnit = allUnits.reduce((latest, current) =>
                    current.timestamp > latest.timestamp ? current : latest
                );
            }
        }

        return GetLatestGenerationDataResponseSchema.parse({
            latestData: latestUnit ? {
                id: latestUnit.id,
                power: latestUnit.power,
                energy: latestUnit.energy,
                generationUnitType: latestUnit.generationUnitType,
                inverterId: latestUnit.inverterId,
                timestamp: latestUnit.timestamp,
            } : null,
        });
    }
}
