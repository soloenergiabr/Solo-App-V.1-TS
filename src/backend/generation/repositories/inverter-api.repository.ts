import { InverterModel } from "../models/inverter.model"
export abstract class InverterApiRepository {
    constructor(protected data: InverterModel) { }

    abstract getRealTimePower(): Promise<void>
    abstract getGenerationByDay(): Promise<void>
    abstract getGenerationByMonth(): Promise<void>
    abstract getGenerationByYear(): Promise<void>
    abstract getGenerationByInterval(): Promise<void>
}