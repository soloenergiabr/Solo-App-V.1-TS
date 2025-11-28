import { InverterModel } from "../../models/inverter.model"
import { ProviderPlant } from "../../models/provider-plant.model"
import { InverterApiRepository } from "../inverter-api.repository"

export class MockInverterApiRepository extends InverterApiRepository {
    constructor(data: InverterModel) { super(data) }

    public realTimePower: number = 0
    public generationByDay: number = 0
    public generationByMonth: number = 0
    public generationByYear: number = 0
    public generationByInterval: number = 0

    getRealTimeGeneration(): Promise<{ power: number, energy: number }> {
        return Promise.resolve({ power: this.realTimePower, energy: this.realTimePower })
    }
    getGenerationByDay(): Promise<number> {
        return Promise.resolve(this.generationByDay)
    }
    getGenerationByMonth(): Promise<number> {
        return Promise.resolve(this.generationByMonth)
    }
    getGenerationByYear(): Promise<number> {
        return Promise.resolve(this.generationByYear)
    }
    getGenerationByInterval(): Promise<number> {
        return Promise.resolve(this.generationByInterval)
    }

    listPlants(): Promise<ProviderPlant[]> {
        return Promise.resolve([])
    }
}