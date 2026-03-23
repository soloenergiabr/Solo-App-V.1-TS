import { randomUUID } from "node:crypto"
import { createHash } from "node:crypto"
import axios, { AxiosRequestConfig } from "axios"
import { InverterModel } from "../../models/inverter.model"
import { ProviderPlant, ProviderPlantStatus } from "../../models/provider-plant.model"
import { InverterApiRepository } from "../inverter-api.repository"

type DeyeLoginResponse = {
    accessToken?: string
    expiresIn?: number
}

type DeyeStationListItem = {
    id?: number
    name?: string
    installedCapacity?: number
    generationPower?: number
    connectionStatus?: string
    locationLat?: number
    locationLng?: number
    locationAddress?: string
    regionNationId?: number
    regionTimezone?: string
    createdDate?: number | string
    lastUpdateTime?: number | string
}

type DeyeStationLatestResponse = {
    generationPower?: number
    batteryPower?: number
    gridPower?: number
    consumptionPower?: number
}

type DeyeStationHistoryResponse = {
    stationDataItems?: Array<{
        generationValue?: number
        generationPower?: number
    }>
}

const DEFAULT_DEYE_URL = 'https://us1-developer.deyecloud.com:443'

export class DeyeInverterApiRepository extends InverterApiRepository {
    private sessionToken?: string
    private tokenExpiresAt?: number
    private sessionAccountKey?: string

    constructor(data?: InverterModel) { super(data) }

    override setInverterData(data: InverterModel): void {
        super.setInverterData(data)
        this.resetSession()
    }

    async getRealTimeGeneration(): Promise<{ power: number, energy: number }> {
        const stationId = Number(this.getProviderId())

        const latestResponse = await this.requestDeye<DeyeStationLatestResponse>('/v1.0/station/latest', {
            method: 'POST',
            body: { stationId }
        })

        console.log('latestResponse', latestResponse)

        const power = this.toNumber(latestResponse?.generationPower)
        const energy = await this.getGenerationByDay()

        return { power, energy }
    }

    async getGenerationByDay(): Promise<number> {
        return this.getHistoryGeneration(2, this.formatDate(this.subDays(new Date(), 1)), this.formatDate(this.addDays(new Date(), 2)))
    }

    async getGenerationByMonth(): Promise<number> {
        const date = new Date()
        const startAt = this.formatMonth(date)
        const endAt = this.formatMonth(new Date(date.getFullYear(), date.getMonth() + 1, 1))
        return this.getHistoryGeneration(3, startAt, endAt)
    }

    async getGenerationByYear(): Promise<number> {
        const year = new Date().getFullYear()
        return this.getHistoryGeneration(4, String(year), String(year + 1))
    }

    async getGenerationByInterval(): Promise<number> {
        return this.getHistoryGeneration(1, this.formatDate(new Date()))
    }

    async listPlants(): Promise<ProviderPlant[]> {
        const allRecords: any[] = []
        let currentPage = 1
        let hasMore = true

        while (hasMore) {
            const response = await this.requestDeye<{ stationList?: DeyeStationListItem[], total?: number }>('/v1.0/station/list', {
                method: 'POST',
                body: {
                    page: currentPage,
                    size: 50
                }
            })

            const records = response?.stationList ?? []
            if (records.length > 0) {
                allRecords.push(...records)
            }

            const total = response?.total ?? 0
            if (allRecords.length >= total || records.length === 0) {
                hasMore = false
            } else {
                currentPage++
            }
        }

        return allRecords.map(record => this.mapPlantRecord(record))
    }

    private async getHistoryGeneration(granularity: number, startAt: string, endAt?: string): Promise<number> {
        const stationId = Number(this.getProviderId())
        const response = await this.requestDeye<DeyeStationHistoryResponse>('/v1.0/station/history', {
            method: 'POST',
            body: {
                stationId,
                granularity,
                startAt,
                endAt: endAt ?? startAt
            }
        })

        console.log('response', response)

        const items = response?.stationDataItems ?? []
        return items.reduce((acc, item) => acc + this.toNumber(item?.generationValue), 0)
    }

    private getProviderId(): string {
        const inverter = this.requireInverterData()
        if (!inverter.providerId) {
            throw new Error('Inverter provider ID is not configured')
        }
        return inverter.providerId
    }

    private async requestDeye<T>(path: string, options: { method?: 'GET' | 'POST', body?: Record<string, unknown>, authenticated?: boolean } = {}): Promise<T> {
        const baseUrl = this.resolveProviderUrl()
        const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
        const url = `${normalizedBase}${path}`

        const headers: Record<string, string> = { 'Content-Type': 'application/json' }

        if (options.authenticated !== false) {
            const token = await this.ensureSession()
            headers['Authorization'] = token.startsWith('Bearer') ? token : `Bearer ${token}`
        }

        const axiosConfig: AxiosRequestConfig = {
            method: options.method ?? 'POST',
            url,
            headers,
            data: options.body
        }

        try {
            const response = await axios(axiosConfig)
            if (response.data && response.data.success === false) {
                throw new Error(`Deye API returned an error: ${response.data.msg || response.data.code}`)
            }
            return response.data
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status ?? 'unknown'
                const errorBody = error.response?.data ? JSON.stringify(error.response.data) : error.message
                throw new Error(`Deye API request failed (${status}): ${errorBody}`)
            }
            throw error
        }
    }

    private async ensureSession(): Promise<string> {
        const { username, password, appId, appSecret } = this.getAuthCredentials()
        const signature = `${username}:${password}:${appId}`

        const isValid = this.sessionToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt && this.sessionAccountKey === signature

        if (isValid && this.sessionToken) {
            return this.sessionToken
        }

        const loginResponse = await this.login(username, password, appId, appSecret)

        const token = loginResponse?.accessToken
        const expiresIn = loginResponse?.expiresIn ?? (7 * 24 * 60 * 60)

        if (!token) {
            throw new Error('Failed to obtain Deye Cloud token')
        }

        this.sessionToken = token
        this.tokenExpiresAt = Date.now() + ((expiresIn - 300) * 1000)
        this.sessionAccountKey = signature

        return this.sessionToken
    }

    private async login(username: string, passwordPlain: string, appId: string, appSecret: string): Promise<DeyeLoginResponse> {
        const baseUrl = this.resolveProviderUrl()
        const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
        const url = `${normalizedBase}/v1.0/account/token?appId=${encodeURIComponent(appId)}`

        const passwordHash = createHash('sha256').update(passwordPlain).digest('hex')

        const body: Record<string, any> = {
            appSecret,
            password: passwordHash
        }

        if (username.includes('@')) {
            body.email = username
        } else {
            body.username = username
        }

        try {
            const response = await axios.post(url, body, {
                headers: { 'Content-Type': 'application/json' }
            })
            const data = response.data

            if (data && data.success === false) {
                throw new Error(`Deye login failed: ${data.msg || data.code}`)
            }

            return data
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status ?? 'unknown'
                const errorBody = error.response?.data ? JSON.stringify(error.response.data) : error.message
                throw new Error(`Deye login request failed (${status}): ${errorBody}`)
            }
            throw error
        }
    }

    private getAuthCredentials(): { username: string, password: string, appId: string, appSecret: string } {
        const username = this.data?.providerApiKey ?? process.env.DEYE_ADMIN_ACCOUNT
        const password = this.data?.providerApiSecret ?? process.env.DEYE_ADMIN_PASSWORD
        const appId = process.env.DEYE_CLOUD_APP_ID
        const appSecret = process.env.DEYE_CLOUD_APP_SECRET

        if (!username || !password) {
            throw new Error('Deye account credentials not configured on the inverter model or .env')
        }

        if (!appId || !appSecret) {
            throw new Error('DEYE_CLOUD_APP_ID or DEYE_CLOUD_APP_SECRET missing in environment variables')
        }

        return { username, password, appId, appSecret }
    }

    private resolveProviderUrl(): string {
        return this.data?.providerUrl ?? process.env.DEYE_CLOUD_API_URL ?? DEFAULT_DEYE_URL
    }

    private formatDate(date: Date): string {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    private formatMonth(date: Date): string {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        return `${year}-${month}`
    }

    private addDays(date: Date, days: number): Date {
        const newDate = new Date(date)
        newDate.setDate(newDate.getDate() + days)
        return newDate
    }

    private subDays(date: Date, days: number): Date {
        const newDate = new Date(date)
        newDate.setDate(newDate.getDate() - days)
        return newDate
    }

    private mapPlantRecord(record: DeyeStationListItem): ProviderPlant {
        return {
            id: record?.id ? String(record.id) : randomUUID(),
            name: record?.name ?? 'Unknown Plant',
            capacityKw: this.toNumber(record?.installedCapacity),
            totalEnergy: 0,
            status: this.mapPlantStatus(record?.connectionStatus),
            location: this.buildLocation(record),
            createdAt: this.parseTimestamp(record?.createdDate),
            updatedAt: this.parseTimestamp(record?.lastUpdateTime)
        }
    }

    private parseTimestamp(value: unknown): Date | undefined {
        if (!value) return undefined
        if (typeof value === 'number') {
            const isSeconds = String(value).length === 10
            return new Date(isSeconds ? value * 1000 : value)
        }
        if (typeof value === 'string') {
            const date = new Date(value)
            if (!isNaN(date.getTime())) return date
        }
        return undefined
    }

    private buildLocation(record: DeyeStationListItem) {
        if (!record) return undefined

        const latitude = this.toNumber(record.locationLat)
        const longitude = this.toNumber(record.locationLng)

        if (!latitude && !longitude && !record.locationAddress) {
            return undefined
        }

        return {
            latitude,
            longitude,
            address: record.locationAddress
        }
    }

    private mapPlantStatus(status: unknown): ProviderPlantStatus {
        if (typeof status === 'string') {
            switch (status.toUpperCase()) {
                case 'NORMAL':
                    return 'ACTIVE'
                case 'PARTIAL_OFFLINE':
                case 'WARNING':
                    return 'WARNING'
                case 'ALL_OFFLINE':
                case 'NO_DEVICE':
                case 'OFFLINE':
                    return 'INACTIVE'
                default:
                    return 'UNKNOWN'
            }
        }

        return 'UNKNOWN'
    }

    private toNumber(value: unknown): number {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value
        }

        if (typeof value === 'string') {
            const parsed = Number.parseFloat(value.replace(/,/g, '.'))
            if (Number.isFinite(parsed)) {
                return parsed
            }
        }

        return 0
    }

    private resetSession(): void {
        this.sessionToken = undefined
        this.tokenExpiresAt = undefined
        this.sessionAccountKey = undefined
    }
}
