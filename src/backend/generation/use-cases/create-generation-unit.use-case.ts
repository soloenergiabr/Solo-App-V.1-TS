import { z } from "zod";
import { InverterRepository } from "../repositories/inverter.repository";
import { GenerationUnitRepository } from "../repositories/generation-unit.repository";
import { GenerationUnitModel, GenerationUnitType } from "../models/generation-unit.model";
import { UserContext } from "@/backend/auth/models/user-context.model";

// Request Schema
export const CreateGenerationUnitRequestSchema = z.object({
    power: z.number().min(0, "Power must be non-negative"),
    energy: z.number().min(0, "Energy must be non-negative"),
    generationUnitType: z.enum(['real_time', 'day', 'month', 'year'], {
        message: "Generation unit type must be one of: real_time, day, month, year"
    }),
    inverterId: z.string().min(1, "Inverter ID is required"),
});

// Response Schema
export const CreateGenerationUnitResponseSchema = z.object({
    generationUnitId: z.string(),
});

// Types generated from schemas
export type CreateGenerationUnitRequest = z.infer<typeof CreateGenerationUnitRequestSchema>;
export type CreateGenerationUnitResponse = z.infer<typeof CreateGenerationUnitResponseSchema>;

export class CreateGenerationUnitUseCase {
    constructor(
        private inverterRepository: InverterRepository,
        private generationUnitRepository: GenerationUnitRepository
    ) { }

    async execute(request: CreateGenerationUnitRequest, userContext: UserContext): Promise<CreateGenerationUnitResponse> {
        // Validate input
        const validatedRequest = CreateGenerationUnitRequestSchema.parse(request);

        // Validate that the inverter exists
        await this.inverterRepository.findById(validatedRequest.inverterId);

        const generationUnit = new GenerationUnitModel({
            power: validatedRequest.power,
            energy: validatedRequest.energy,
            generationUnitType: validatedRequest.generationUnitType as GenerationUnitType,
            inverterId: validatedRequest.inverterId,
        });

        await this.generationUnitRepository.create(generationUnit);

        return CreateGenerationUnitResponseSchema.parse({
            generationUnitId: generationUnit.id
        });
    }
}
