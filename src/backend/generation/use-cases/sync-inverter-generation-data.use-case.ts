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

    async execute(request: SyncInverterGenerationDataRequest): Promise<SyncInverterGenerationDataResponse> {
        // Validate input
        const validatedRequest = SyncInverterGenerationDataRequestSchema.parse(request);

        let unitsCreated = 0;
        let unitsUpdated = 0;

        // Buscar inversor
        const inverter = await this.inverterRepository.findById(validatedRequest.inverterId);
        if (!inverter) {
            throw new Error(`Inverter with ID ${validatedRequest.inverterId} not found`);
        }

        // Buscar dados em tempo real da API do inversor
        const inverterApiRepository = InverterApiFactory.create(inverter);
        const { power, energy } = await inverterApiRepository.getRealTimeGeneration();

        // Buscar todas as generation units existentes do inversor
        const existingGenerations = await this.generationUnitRepository.findByInverterId(validatedRequest.inverterId);

        const now = new Date();

        // 1. TEMPO REAL - Sempre cria um novo registro
        const realTimeUnit = new GenerationUnitModel({
            power,
            energy,
            generationUnitType: 'real_time',
            inverterId: inverter.id
        });
        await this.generationUnitRepository.create(realTimeUnit);
        unitsCreated++;

        // 2. DIÁRIO - Cria se não existir hoje, atualiza se já existir
        const todayGeneration = existingGenerations.find(gen =>
            gen.generationUnitType === 'day' &&
            this.isSameDay(gen.timestamp, now)
        );

        if (!todayGeneration) {
            const dayUnit = new GenerationUnitModel({
                power,
                energy,
                generationUnitType: 'day',
                inverterId: inverter.id
            });
            await this.generationUnitRepository.create(dayUnit);
            unitsCreated++;
        } else {
            const updatedDayUnit = new GenerationUnitModel({
                id: todayGeneration.id,
                power,
                energy,
                generationUnitType: 'day',
                inverterId: inverter.id
            });
            await this.generationUnitRepository.update(updatedDayUnit);
            unitsUpdated++;
        }

        // 3. MENSAL - Cria se não existir este mês, atualiza se já existir
        const thisMonthGeneration = existingGenerations.find(gen =>
            gen.generationUnitType === 'month' &&
            this.isSameMonth(gen.timestamp, now)
        );

        if (!thisMonthGeneration) {
            const monthUnit = new GenerationUnitModel({
                power,
                energy,
                generationUnitType: 'month',
                inverterId: inverter.id
            });
            await this.generationUnitRepository.create(monthUnit);
            unitsCreated++;
        } else {
            const updatedMonthUnit = new GenerationUnitModel({
                id: thisMonthGeneration.id,
                power,
                energy,
                generationUnitType: 'month',
                inverterId: inverter.id
            });
            await this.generationUnitRepository.update(updatedMonthUnit);
            unitsUpdated++;
        }

        // 4. ANUAL - Cria se não existir este ano, atualiza se já existir
        const thisYearGeneration = existingGenerations.find(gen =>
            gen.generationUnitType === 'year' &&
            this.isSameYear(gen.timestamp, now)
        );

        if (!thisYearGeneration) {
            const yearUnit = new GenerationUnitModel({
                power,
                energy,
                generationUnitType: 'year',
                inverterId: inverter.id
            });
            await this.generationUnitRepository.create(yearUnit);
            unitsCreated++;
        } else {
            const updatedYearUnit = new GenerationUnitModel({
                id: thisYearGeneration.id,
                power,
                energy,
                generationUnitType: 'year',
                inverterId: inverter.id
            });
            await this.generationUnitRepository.update(updatedYearUnit);
            unitsUpdated++;
        }

        return SyncInverterGenerationDataResponseSchema.parse({
            success: true,
            inverterId: validatedRequest.inverterId,
            unitsCreated,
            unitsUpdated,
            message: `Successfully synced data for inverter ${inverter.id}. Created ${unitsCreated} units, updated ${unitsUpdated} units.`
        });
    }

    // Métodos auxiliares para comparação de datas
    private isSameDay(date1: Date, date2: Date): boolean {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    }

    private isSameMonth(date1: Date, date2: Date): boolean {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth();
    }

    private isSameYear(date1: Date, date2: Date): boolean {
        return date1.getFullYear() === date2.getFullYear();
    }
}