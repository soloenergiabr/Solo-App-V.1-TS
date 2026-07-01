import axios from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InverterModel } from '../models/inverter.model'
import { SolplanetProInverterApiRepository } from '../repositories/implementations/solplanet-pro.inverter-api.repository'

const { axiosRequest, axiosPost, isAxiosError } = vi.hoisted(() => ({
    axiosRequest: vi.fn(),
    axiosPost: vi.fn(),
    isAxiosError: vi.fn(() => false),
}))

vi.mock('axios', () => {
    const mockAxios = Object.assign(axiosRequest, {
        post: axiosPost,
        isAxiosError,
    })
    return {
        default: mockAxios,
        isAxiosError,
    }
})

const mockedAxios = vi.mocked(axios)

describe('SolplanetProInverterApiRepository', () => {
    const inverter = new InverterModel(
        'inv-solplanet',
        'Solplanet Test',
        'solplanet',
        'plant-123',
        'account',
        'password',
        'https://solplanet.example.test/api'
    )

    beforeEach(() => {
        vi.clearAllMocks()
        axiosPost.mockResolvedValue({
            data: { result: { token: 'session-token' } },
            headers: {},
        })
    })

    it('returns real-time power and energy when Solplanet returns plant detail', async () => {
        mockedAxios.mockResolvedValue({
            data: {
                result: {
                    totalPower: 4.2,
                    etoday: 13.7,
                    etotal: 100,
                },
            },
        })

        const repository = new SolplanetProInverterApiRepository(inverter)

        await expect(repository.getRealTimeGeneration()).resolves.toEqual({
            power: 4.2,
            energy: 13.7,
        })
    })

    it('throws a descriptive error when Solplanet returns no plant detail result', async () => {
        mockedAxios.mockResolvedValue({ data: {} })

        const repository = new SolplanetProInverterApiRepository(inverter)

        await expect(repository.getRealTimeGeneration()).rejects.toThrow(
            'Solplanet API returned no result for plant plant-123'
        )
    })

    it('throws a descriptive error when Solplanet login returns no token', async () => {
        axiosPost.mockResolvedValue({
            data: { result: {} },
            headers: {},
        })

        const repository = new SolplanetProInverterApiRepository(inverter)

        await expect(repository.getRealTimeGeneration()).rejects.toThrow(
            'Solplanet login failed for inverter inv-solplanet'
        )
    })
})
