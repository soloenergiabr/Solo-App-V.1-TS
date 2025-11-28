import { InverterModel } from "../models/inverter.model"
import { ProviderPlant } from "../models/provider-plant.model"

export abstract class InverterApiRepository {
    constructor(protected data?: InverterModel) { }

    setInverterData(data: InverterModel): void {
        this.data = data
    }

    protected requireInverterData(): InverterModel {
        if (!this.data) {
            throw new Error('Inverter context is required for this operation')
        }
        return this.data
    }

    abstract getRealTimeGeneration(): Promise<{ power: number, energy: number }>
    abstract getGenerationByDay(): Promise<number>
    abstract getGenerationByMonth(): Promise<number>
    abstract getGenerationByYear(): Promise<number>
    abstract getGenerationByInterval(): Promise<number>
    abstract listPlants(): Promise<ProviderPlant[]>
}