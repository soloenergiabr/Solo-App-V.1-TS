import { z } from "zod";
import { InverterApiFactory } from "../repositories/inverter-api.factory";
import { InverterRepository } from "../repositories/inverter.repository";
import { GenerationUnitRepository } from "../repositories/generation-unit.repository";
import { GenerationUnitModel } from "../models/generation-unit.model";
import { UserContext } from "@/backend/auth/models/user-context.model";

// Request Schema
export const SyncInverterGenerationDataRequestSchema = z.object({
    inverterId: z.string().min(1, "Inverter ID is required"),
});

// Response Schema
export const SyncInverterGenerationDataResponseSchema = z.object({
    success: z.boolean(),
    inverterId: z.string(),
    unitsCreated: z.number(),
    unitsUpdated: z.number(),
    message: z.string(),
});

// Types generated from schemas
export type SyncInverterGenerationDataRequest = z.infer<typeof SyncInverterGenerationDataRequestSchema>;
export type SyncInverterGenerationDataResponse = z.infer<typeof SyncInverterGenerationDataResponseSchema>;

export class SyncInverterGenerationDataUseCase {
    constructor(
        private inverterRepository: InverterRepository,
        private generationUnitRepository: GenerationUnitRepository
    ) { }

    async execute(request: SyncInverterGenerationDataRequest, userContext: UserContext): Promise<SyncInverterGenerationDataResponse> {
        // Validate input
        const validatedRequest = SyncInverterGenerationDataRequestSchema.parse(request);

        let unitsCreated = 0;
        let unitsUpdated = 0;
        const inverter = await this.inverterRepository.findById(validatedRequest.inverterId)

        const inverterApiRepository = InverterApiFactory.create(inverter)

        const { power, energy } = await inverterApiRepository.getRealTimeGeneration()

        const generations = await this.generationUnitRepository.findByInverterId(validatedRequest.inverterId);

        const hasTodayGeneration = generations.find(generation => generation.generationUnitType === 'day' && generation.timestamp.toDateString() === new Date().toDateString())

        if (!hasTodayGeneration) {
            const generationUnit = new GenerationUnitModel({
                power,
                energy,
                generationUnitType: 'day',
                inverterId: inverter.id
            })
            await this.generationUnitRepository.create(generationUnit)
            unitsCreated++
        }
        else {
            const generationUnit = new GenerationUnitModel({
                id: hasTodayGeneration.id,
                power,
                energy,
                generationUnitType: 'day',
                inverterId: inverter.id
            })

            await this.generationUnitRepository.update(generationUnit)
            unitsUpdated++
        }

        const hasThisMonthGeneration = generations.some(generation => generation.generationUnitType === 'month' && generation.timestamp.getMonth() === new Date().getMonth() && generation.timestamp.getFullYear() === new Date().getFullYear())

        if (!hasThisMonthGeneration) {
            const generationUnit = new GenerationUnitModel({
                power,
                energy,
                generationUnitType: 'month',
                inverterId: inverter.id
            })
            await this.generationUnitRepository.create(generationUnit)
            unitsCreated++
        }

        const hasThisYearGeneration = generations.some(generation => generation.generationUnitType === 'year' && generation.timestamp.getFullYear() === new Date().getFullYear())

        if (!hasThisYearGeneration) {
            const generationUnit = new GenerationUnitModel({
                power,
                energy,
                generationUnitType: 'year',
                inverterId: inverter.id
            })
            await this.generationUnitRepository.create(generationUnit)
            unitsCreated++
        }

        const hasThisMinuteRealTimeGeneration = generations.some(generation => generation.generationUnitType === 'real_time' && generation.timestamp.toDateString() === new Date().toDateString() && generation.timestamp.getHours() === new Date().getHours() && generation.timestamp.getMinutes() === new Date().getMinutes())

        if (!hasThisMinuteRealTimeGeneration) {
            const generationUnit = new GenerationUnitModel({
                power,
                energy,
                generationUnitType: 'real_time',
                inverterId: inverter.id
            })
            await this.generationUnitRepository.create(generationUnit)
            unitsCreated++
        }

        return SyncInverterGenerationDataResponseSchema.parse({
            success: true,
            inverterId: validatedRequest.inverterId,
            unitsCreated,
            unitsUpdated,
            message: `Successfully synced data for inverter ${inverter.id}. Created ${unitsCreated} units, updated ${unitsUpdated} units.`
        })
    }
}