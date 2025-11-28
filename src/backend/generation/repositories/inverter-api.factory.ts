import { InverterModel } from "../models/inverter.model"
import { InverterApiRepository } from "./inverter-api.repository"
import { SolisInverterApiRepository } from "./implementations/solis.inverter-api.repository"
import { SolplanetInverterApiRepository } from "./implementations/solplanet.inverter-api.repository"
import { MockInverterApiRepository } from "./implementations/mock.inverter-api.repository"
import { SolplanetProInverterApiRepository } from "./implementations/solplanet-pro.inverter-api.repository"

export class InverterApiFactory {
    static create(inverter: InverterModel): InverterApiRepository {
        switch (inverter.provider) {
            case 'solis':
                return new SolisInverterApiRepository(inverter)
            case 'solplanet':
                return new SolplanetProInverterApiRepository(inverter)
            case 'mock':
                return new MockInverterApiRepository(inverter)
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
