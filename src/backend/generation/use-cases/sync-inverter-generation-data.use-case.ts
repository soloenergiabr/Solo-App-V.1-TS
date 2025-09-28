import { InverterApiFactory } from "../repositories/inverter-api.factory";
import { InverterRepository } from "../repositories/inverter.repository";

export class SyncInverterGenerationDataUseCase {
    constructor(
        private inverterRepository: InverterRepository
    ) { }

    async execute() {
        const inverters = await this.inverterRepository.find()
        inverters.forEach(async (inverter) => {

            const inverterApiRepository = InverterApiFactory.create(inverter)

            const realTimePower = await inverterApiRepository.getRealTimePower()
        })
    }
}