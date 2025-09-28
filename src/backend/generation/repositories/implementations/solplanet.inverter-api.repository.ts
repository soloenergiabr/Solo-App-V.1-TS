import { InverterModel } from "../../models/inverter.model"
import { InverterApiRepository } from "../inverter-api.repository"

export class SolplanetInverterApiRepository extends InverterApiRepository {
    constructor(data: InverterModel) { super(data) }

    getRealTimeGeneration(): Promise<{ power: number, energy: number }> {
        return Promise.resolve({ power: 1, energy: 1 })
    }
    getGenerationByDay(): Promise<number> {
        return Promise.resolve(1)
    }
    getGenerationByMonth(): Promise<number> {
        return Promise.resolve(1)
    }
    getGenerationByYear(): Promise<number> {
        return Promise.resolve(1)
    }
    getGenerationByInterval(): Promise<number> {
        return Promise.resolve(1)
    }
}