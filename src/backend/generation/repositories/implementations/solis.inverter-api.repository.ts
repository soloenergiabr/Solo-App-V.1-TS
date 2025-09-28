import { InverterModel } from "../../models/inverter.model"
import { InverterApiRepository } from "../inverter-api.repository"

export class SolisInverterApiRepository extends InverterApiRepository {
    constructor(data: InverterModel) { super(data) }

    getRealTimePower(): Promise<void> {
        throw new Error('Method not implemented.')
    }
    getGenerationByDay(): Promise<void> {
        throw new Error('Method not implemented.')
    }
    getGenerationByMonth(): Promise<void> {
        throw new Error('Method not implemented.')
    }
    getGenerationByYear(): Promise<void> {
        throw new Error('Method not implemented.')
    }
    getGenerationByInterval(): Promise<void> {
        throw new Error('Method not implemented.')
    }
}