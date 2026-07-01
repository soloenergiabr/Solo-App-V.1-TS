import axios from 'axios'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { InverterModel } from '../models/inverter.model'
import { SolisInverterApiRepository } from '../repositories/implementations/solis.inverter-api.repository'

vi.mock('axios', () => ({
    default: {
        post: vi.fn(),
        isAxiosError: vi.fn(() => false),
    },
}))

const mockedPost = axios.post as unknown as Mock

describe('SolisInverterApiRepository', () => {
    const inverter = new InverterModel(
        'inv-solis',
        'Solis Test',
        'solis',
        'provider-123',
        'api-key',
        'api-secret',
        'https://solis.example.test'
    )

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns real-time power and energy when Solis returns valid data', async () => {
        mockedPost.mockResolvedValue({
            data: {
                code: 0,
                success: true,
                data: { pac: 5200, eToday: 18.4 },
            },
        })

        const repository = new SolisInverterApiRepository(inverter)

        await expect(repository.getRealTimeGeneration()).resolves.toEqual({
            power: 5200,
            energy: 18.4,
        })
    })

    it('throws a descriptive error when Solis returns an unsuccessful envelope', async () => {
        mockedPost.mockResolvedValue({
            data: {
                code: 1001,
                success: false,
                data: null,
            },
        })

        const repository = new SolisInverterApiRepository(inverter)

        await expect(repository.getRealTimeGeneration()).rejects.toThrow(
            'Solis API returned error for inverter inv-solis'
        )
    })

    it('throws a descriptive error when Solis returns no data payload', async () => {
        mockedPost.mockResolvedValue({
            data: {
                code: 0,
                success: true,
                data: null,
            },
        })

        const repository = new SolisInverterApiRepository(inverter)

        await expect(repository.getRealTimeGeneration()).rejects.toThrow(
            'Solis API returned empty data for inverter inv-solis'
        )
    })
})
