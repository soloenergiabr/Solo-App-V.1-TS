import { InverterModel } from "../models/inverter.model"
import { InverterApiRepository } from "./inverter-api.repository"
import { SolisInverterApiRepository } from "./implementations/solis.inverter-api.repository"
import { SolplanetInverterApiRepository } from "./implementations/solplanet.inverter-api.repository"
import { MockInverterApiRepository } from "./implementations/mock.inverter-api.repository"

export class InverterApiFactory {
    static create(inverter: InverterModel): InverterApiRepository {
        switch (inverter.provider) {
            case 'solis':
                return new SolisInverterApiRepository(inverter)
            case 'solplanet':
                return new SolplanetInverterApiRepository(inverter)
            case 'mock':
                return new MockInverterApiRepository(inverter)
            default:
                throw new Error('Provider not found')
        }
    }
}
