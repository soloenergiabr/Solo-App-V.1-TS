import { randomUUID } from "node:crypto"
import { createHash, createHmac } from "node:crypto"
import axios from "axios"
import { InverterModel } from "../../models/inverter.model"
import { ProviderPlant } from "../../models/provider-plant.model"
import { InverterApiRepository } from "../inverter-api.repository"

export class SolisInverterApiRepository extends InverterApiRepository {
    constructor(data?: InverterModel) { super(data) }

    async getRealTimeGeneration(): Promise<{ power: number, energy: number }> {
        const inverter = this.requireInverterData()
        if (!inverter.providerId) {
            throw new Error('Inverter provider ID is not configured')
        }

        const resource = '/v1/api/inverterDetail'
        const body = { id: inverter.providerId }

        const { data } = await this.postToSolis<{ data: { pac?: number, eToday?: number } }>(resource, body, inverter)
        const totalPower = data.pac || 0
        const energyToday = data.eToday || 0

        return { power: totalPower, energy: energyToday }
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

    async listPlants(): Promise<ProviderPlant[]> {
        const inverter = this.getOperationalInverter()
        const response = await this.postToSolis<{ data?: { records?: any[] } }>('/v1/api/inverterDetailList', {
            pageNo: 1,
            pageSize: 50
        }, inverter)

        const records = response?.data?.records ?? []
        return records.map(record => this.mapPlantRecord(record))
    }

    private getOperationalInverter(): InverterModel {
        if (this.data) {
            return this.data
        }

        const apiKey = process.env.SOLIS_ADMIN_API_KEY
        const apiSecret = process.env.SOLIS_ADMIN_API_SECRET
        const providerUrl = process.env.SOLIS_ADMIN_API_URL ?? 'https://api.soliscloud.com:9003'

        if (!apiKey || !apiSecret) {
            throw new Error('Solis admin credentials are not configured')
        }

        return new InverterModel(
            'solis_admin_provider',
            'Solis Admin Provider',
            'solis',
            '',
            apiKey,
            apiSecret,
            providerUrl
        )
    }

    private mapPlantRecord(record: any): ProviderPlant {
        return {
            id: record?.id ? String(record.id) : randomUUID(),
            name: record?.stationName ?? record?.name ?? 'Unknown Plant',
            capacityKw: this.toNumber(record?.capacity ?? record?.totalPower),
            totalEnergy: this.toNumber(record?.totalEnergy ?? record?.eTotal),
            status: this.mapPlantStatus(record?.status),
            location: this.buildLocation(record),
            createdAt: record?.createdAt ? new Date(record.createdAt) : undefined,
            updatedAt: record?.updatedAt ? new Date(record.updatedAt) : undefined
        }
    }

    private buildLocation(record: any) {
        if (!record) return undefined

        const latitude = this.toNumber(record.latitude)
        const longitude = this.toNumber(record.longitude)

        if (!latitude && !longitude && !record.country && !record.city && !record.address) {
            return undefined
        }

        return {
            latitude,
            longitude,
            country: record.country,
            state: record.state,
            city: record.city,
            address: record.address
        }
    }

    private mapPlantStatus(status: unknown) {
        if (typeof status === 'string') {
            switch (status.toLowerCase()) {
                case 'online':
                case 'active':
                    return 'ACTIVE'
                case 'offline':
                case 'inactive':
                    return 'INACTIVE'
                case 'warning':
                    return 'WARNING'
                case 'error':
                case 'fault':
                    return 'ERROR'
                default:
                    return 'UNKNOWN'
            }
        }

        if (typeof status === 'number') {
            switch (status) {
                case 0:
                    return 'ACTIVE'
                case 1:
                    return 'INACTIVE'
                case 2:
                    return 'WARNING'
                case 3:
                    return 'ERROR'
            }
        }

        return 'UNKNOWN'
    }

    private toNumber(value: unknown): number | undefined {
        if (typeof value === 'number') {
            return Number.isFinite(value) ? value : undefined
        }

        if (typeof value === 'string') {
            const parsed = Number.parseFloat(value)
            return Number.isFinite(parsed) ? parsed : undefined
        }

        return undefined
    }

    private async postToSolis<T>(resource: string, body: Record<string, unknown>, inverter: InverterModel): Promise<T> {
        const headers = this.getRequestHeaders(inverter, {
            body,
            verb: 'POST',
            contentType: 'application/json',
            canonicalizedResource: resource
        })

        const baseUrl = inverter.providerUrl ?? process.env.SOLIS_ADMIN_API_URL ?? 'https://api.soliscloud.com:9003'

        try {
            const response = await axios.post<T>(`${baseUrl}${resource}`, body, {
                headers
            })
            return response.data
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status ?? 'unknown'
                const errorText = error.response?.data ? JSON.stringify(error.response.data) : error.message
                throw new Error(`Failed to communicate with Solis API (${status}): ${errorText}`)
            }
            throw error
        }
    }

    private getRequestHeaders(inverter: InverterModel, { body, verb, contentType, canonicalizedResource }: { body: any, verb: string, contentType: string, canonicalizedResource: string }) {
        const apiSecret = inverter.providerApiSecret ?? process.env.SOLIS_ADMIN_API_SECRET
        if (!apiSecret) {
            throw new Error('Inverter API secret not found')
        }

        const apiKey = inverter.providerApiKey ?? process.env.SOLIS_ADMIN_API_KEY
        if (!apiKey) {
            throw new Error('Inverter API key not found')
        }

        const gmtTime = new Date().toUTCString()

        const calculateContentMD5 = (body: any): string => {
            if (!body) return ''
            const md5Hash = createHash('md5').update(body).digest()
            return md5Hash.toString('base64')
        }

        const generateSignature = (verb: string, contentMD5: string, contentType: string, date: string, canonicalizedResource: string): string => {
            const stringToSign = `${verb}\n${contentMD5}\n${contentType}\n${date}\n${canonicalizedResource}`
            const hmac = createHmac('sha1', apiSecret)
            hmac.update(stringToSign)
            return hmac.digest('base64')
        }

        const bodyStr = typeof body === 'object' ? JSON.stringify(body) : body || ''

        const date = gmtTime
        const contentMD5 = calculateContentMD5(bodyStr)
        const signature = generateSignature(verb, contentMD5, contentType, date, canonicalizedResource)
        const authorization = `API ${apiKey}:${signature}`

        return {
            'Content-MD5': contentMD5,
            'Content-Type': contentType,
            'Date': date,
            'Authorization': authorization
        }
    }
}