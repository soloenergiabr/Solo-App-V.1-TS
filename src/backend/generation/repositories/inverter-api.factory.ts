import { InverterModel } from "../models/inverter.model"
import { InverterApiRepository } from "./inverter-api.repository"
import { SolisInverterApiRepository } from "./implementations/solis.inverter-api.repository"
import { SolplanetInverterApiRepository } from "./implementations/solplanet.inverter-api.repository"
import { MockInverterApiRepository } from "./implementations/mock.inverter-api.repository"
import { SolplanetProInverterApiRepository } from "./implementations/solplanet-pro.inverter-api.repository"
import { HoymilesInverterApiRepository } from "./implementations/hoymiles.inverter-api.repository"
import { DeyeInverterApiRepository } from "./implementations/deye.inverter-api.repository"
import { AuxsolInverterApiRepository } from "./implementations/auxsol.inverter-api.repository"
export class InverterApiFactory {
    static create(inverter: InverterModel): InverterApiRepository {
        switch (inverter.provider) {
            case 'solis':
                return new SolisInverterApiRepository(inverter)
            case 'solplanet':
                return new SolplanetProInverterApiRepository(inverter)
            case 'mock':
                return new MockInverterApiRepository(inverter)
            case 'deye':
                return new DeyeInverterApiRepository(inverter)
            case 'hoymiles':
                return new HoymilesInverterApiRepository(inverter)
            case 'auxsol':
                return new AuxsolInverterApiRepository(inverter)
            default:
                throw new Error('Provider not found')
        }
    }

    static createForProvider(provider: string, overrides: Partial<InverterModel> = {}): InverterApiRepository {
        const normalizedProvider = provider.toLowerCase()
        const placeholderId = overrides.id ?? `provider_${normalizedProvider}`

        const inverter = new InverterModel(
            placeholderId,
            overrides.name ?? `${normalizedProvider.toUpperCase()} Provider`,
            normalizedProvider,
            overrides.providerId ?? '',
            overrides.providerApiKey,
            overrides.providerApiSecret,
            overrides.providerUrl,
            overrides.clientId
        )

        return this.create(inverter)
    }
}
