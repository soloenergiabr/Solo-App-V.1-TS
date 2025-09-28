import { describe, it, expect, beforeEach } from 'vitest'
import { InverterApiRepository } from './inverter-api.repository';
import { InverterApiFactory } from './inverter-api.factory';

let inverterApiRepository: InverterApiRepository = InverterApiFactory.create({
    id: '1',
    name: 'My inverter',
    provider: 'solis',
    providerId: '1',
    providerApiKey: '1',
    providerApiSecret: '1',
    providerUrl: '1',
})

describe('Solis Inverter Api Repository', () => {
    it('should get real time power', async () => {
        expect(inverterApiRepository.getRealTimePower()).resolves.not.toThrow()
    })
})
