import { InverterModel } from "../models/inverter.model"
export abstract class InverterApiRepository {
    constructor(protected data: InverterModel) { }

    abstract getRealTimeGeneration(): Promise<{ power: number, energy: number }>
    abstract getGenerationByDay(): Promise<number>
    abstract getGenerationByMonth(): Promise<number>
    abstract getGenerationByYear(): Promise<number>
    abstract getGenerationByInterval(): Promise<number>
}