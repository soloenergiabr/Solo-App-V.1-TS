import { InverterApiFactory } from "../repositories/inverter-api.factory";
import { InverterRepository } from "../repositories/inverter.repository";
import { GenerationUnitRepository } from "../repositories/generation-unit.repository";
import { GenerationUnitModel } from "../models/generation-unit.model";

export class SyncInverterGenerationDataUseCase {
    constructor(
        private inverterRepository: InverterRepository,
        private generationUnitRepository: GenerationUnitRepository
    ) { }

    async execute({ inverterId }: { inverterId: string }) {
        const inverter = await this.inverterRepository.findById(inverterId)

        const inverterApiRepository = InverterApiFactory.create(inverter)

        const { power, energy } = await inverterApiRepository.getRealTimeGeneration()

        const generations = await this.generationUnitRepository.findByInverterId(inverterId);

        const hasTodayGeneration = generations.find(generation => generation.generationUnitType === 'day' && generation.timestamp.toDateString() === new Date().toDateString())

        if (!hasTodayGeneration) {
            const generationUnit = new GenerationUnitModel({
                power,
                energy,
                generationUnitType: 'day',
                inverterId: inverter.id
            })
            await this.generationUnitRepository.create(generationUnit)
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
        }
    }
}