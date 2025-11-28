import { randomUUID } from "node:crypto"
import axios, { AxiosRequestConfig } from "axios"
import { InverterModel } from "../../models/inverter.model"
import { ProviderPlant, ProviderPlantStatus } from "../../models/provider-plant.model"
import { InverterApiRepository } from "../inverter-api.repository"

type SolplanetLoginResponse = {
    data?: {
        apitoken?: string
        token?: string
        expire?: number
    }
    apitoken?: string
    token?: string
    expire?: number
}

type SolplanetPlantListResponse = {
    result?: Array<any>
}

type SolplanetPlantDetailResponse = {
    result?: {
        detail?: any
    }
}

type SolplanetProductionResponse = {
    result?: {
        data?: {
            ac?: Array<string | number>
        }
        x?: Array<string>
    }
}

type SolplanetYearResponse = {
    result?: Array<{ energy?: number | string, value?: number | string }>
}

type SolplanetRequestOptions = {
    method?: 'GET' | 'POST'
    params?: Record<string, string | number | boolean | undefined>
    body?: Record<string, unknown>
    authenticated?: boolean
}

const DEFAULT_SOLPLANET_URL = 'https://internation-cloud.solplanet.net/api'
const INTERVAL_HOURS = 10 / 60 // 10-minute intervals in hours

export class SolplanetInverterApiRepository extends InverterApiRepository {
    private sessionToken?: string
    private sessionCookie?: string
    private tokenExpiresAt?: number
    private sessionAccountKey?: string

    constructor(data?: InverterModel) { super(data) }

    override setInverterData(data: InverterModel): void {
        super.setInverterData(data)
        this.resetSession()
    }

    async getRealTimeGeneration(): Promise<{ power: number, energy: number }> {
        const plantId = this.getProviderId()
        const detailResponse = await this.requestSolplanet<SolplanetPlantDetailResponse>('/plant/detail/international', {
            method: 'GET',
            params: { id: plantId }
        })

        const detail = detailResponse?.result?.detail ?? {}
        const power = this.toNumber(detail?.ePower ?? detail?.pac)
        const energy = this.toNumber(detail?.eToday ?? detail?.eDay ?? detail?.dailyProduction?.ac)

        return { power, energy }
    }

    async getGenerationByDay(): Promise<number> {
        const intervals = await this.fetchDailyProduction()
        return intervals.reduce((acc, value) => acc + (value * INTERVAL_HOURS), 0)
    }

    async getGenerationByMonth(): Promise<number> {
        const plantId = this.getProviderId()
        const response = await this.requestSolplanet<SolplanetProductionResponse>('/chart/production/international/month', {
            method: 'GET',
            params: {
                plantId,
                isno: '',
                date: this.formatMonth(new Date())
            }
        })

        const series = response?.result?.data?.ac ?? []
        const values = series.map(value => this.toNumber(value))
        return values.reduce((acc, value) => acc + value, 0)
    }

    async getGenerationByYear(): Promise<number> {
        const plantId = this.getProviderId()
        const year = this.formatYear(new Date())
        const response = await this.requestSolplanet<SolplanetYearResponse>(`/plant/${plantId}/year/${year}`, {
            method: 'GET'
        })

        const series = response?.result ?? []
        return series.reduce((acc, entry) => acc + this.toNumber(entry?.energy ?? entry?.value), 0)
    }

    async getGenerationByInterval(): Promise<number> {
        const intervals = await this.fetchDailyProduction()
        if (!intervals.length) {
            return 0
        }

        return intervals[intervals.length - 1]
    }

    async listPlants(): Promise<ProviderPlant[]> {
        const response = await this.requestSolplanet<SolplanetPlantListResponse>('/plant/plantList', {
            method: 'GET',
            params: {
                own: 1,
                type: 1,
                state: 0
            }
        })

        const records = response?.result ?? []
        return records.map(record => this.mapPlantRecord(record))
    }

    private async fetchDailyProduction(date = new Date()): Promise<number[]> {
        const plantId = this.getProviderId()
        const response = await this.requestSolplanet<SolplanetProductionResponse>('/chart/production/international/daily', {
            method: 'GET',
            params: {
                plantId,
                isno: '',
                date: this.formatDate(date)
            }
        })

        const series = response?.result?.data?.ac ?? []
        return series.map(value => this.toNumber(value))
    }

    private getProviderId(): string {
        const inverter = this.requireInverterData()
        if (!inverter.providerId) {
            throw new Error('Inverter provider ID is not configured')
        }
        return inverter.providerId
    }

    private async requestSolplanet<T>(path: string, options: SolplanetRequestOptions = {}): Promise<T> {
        const baseUrl = this.resolveProviderUrl()
        const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
        const normalizedPath = path.startsWith('/') ? path : `/${path}`
        const url = `${normalizedBase}${normalizedPath}`

        const headers: Record<string, string> = options.method === 'GET' ? {} : { 'Content-Type': 'application/json' }

        if (options.authenticated !== false) {
            const { token, cookie } = await this.ensureSession()
            headers['Token'] = token
            headers['Authorization'] = `Bearer ${token}`
            if (cookie) {
                headers['Cookie'] = cookie
            }
        }

        // Clean up params - remove undefined/null/empty values
        const cleanParams: Record<string, string | number | boolean> = {}
        if (options.params) {
            Object.entries(options.params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    cleanParams[key] = value
                }
            })
        }

        const axiosConfig: AxiosRequestConfig = {
            method: options.method ?? 'GET',
            url,
            headers,
            params: Object.keys(cleanParams).length > 0 ? cleanParams : undefined,
            data: options.method && options.method !== 'GET' && options.body ? options.body : undefined
        }

        console.log({
            url: axiosConfig.url,
            params: axiosConfig.params,
            headers: axiosConfig.headers,
            data: axiosConfig.data
        })

        try {
            const response = await axios(axiosConfig)
            return response.data
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status ?? 'unknown'
                const errorBody = error.response?.data ? JSON.stringify(error.response.data) : error.message
                throw new Error(`Solplanet API request failed (${status}): ${errorBody}`)
            }
            throw error
        }
    }

    private async ensureSession(): Promise<{ token: string, cookie?: string }> {
        const { account, password } = this.getAuthCredentials()
        const signature = `${account}:${password}`
        const isValid = this.sessionToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt && this.sessionAccountKey === signature

        if (isValid && this.sessionToken) {
            return {
                token: this.sessionToken,
                cookie: this.sessionCookie
            }
        }


        const login = await this.login(account, password)
        console.log({
            login
        })
        const token = login?.data?.token ?? login?.token
        const apiKey = login?.data?.apitoken ?? login?.apitoken
        const expireSeconds = login?.data?.expire ?? login?.expire

        if (!token) {
            throw new Error('Failed to obtain Solplanet token')
        }

        this.sessionToken = token
        this.sessionCookie = apiKey ? this.buildCookie(apiKey) : undefined
        this.tokenExpiresAt = expireSeconds ? Date.now() + expireSeconds * 1000 : Date.now() + (15 * 60 * 1000)
        this.sessionAccountKey = signature

        return {
            token: this.sessionToken,
            cookie: this.sessionCookie
        }
    }

    private async login(account: string, password: string): Promise<SolplanetLoginResponse> {
        return this.requestSolplanet<SolplanetLoginResponse>('/user/login', {
            method: 'POST',
            params: { account, password },
            authenticated: false
        })
    }

    private buildCookie(apiToken: string): string {
        // Build complete cookie string as required by Solplanet API
        const cookieParts = [
            `_gcl_au=1.1.1987727706.1740715008`,
            `__hstc=54062199.1f98f9925c1442e837d63897e23e5625.1740715008056.1740715008056.1740715008056.1`,
            `hubspotutk=1f98f9925c1442e837d63897e23e5625`,
            `__hssrc=1`,
            `_fbp=fb.1.1740715008357.130254213474060619`,
            `_hjSessionUser_2094458=eyJpZCI6IjZhNThlOWViLWIzZTItNTEzNi05Mzk3LTNjZjc5OWQ1N2VmOCIsImNyZWF0ZWQiOjE3NDA3MTUwMDcyODYsImV4aXN0aW5nIjp0cnVlfQ==`,
            `_ga=GA1.2.616218179.1740715006`,
            `_ga_WM8F92BL5N=GS1.1.1740752018.2.0.1740752018.60.0.0`,
            `acw_tc=0bc1a08717408397829241121e760be9d793800a816405deb633393b1a60ec`,
            `apitoken=${apiToken}`
        ]
        return cookieParts.join('; ')
    }

    private getAuthCredentials(): { account: string, password: string } {
        const account = this.data?.providerApiKey ?? process.env.SOLPLANET_ADMIN_ACCOUNT
        const password = this.data?.providerApiSecret ?? process.env.SOLPLANET_ADMIN_PASSWORD

        if (!account || !password) {
            throw new Error('Solplanet account credentials not configured')
        }

        return { account, password }
    }

    private resolveProviderUrl(): string {
        return this.data?.providerUrl ?? process.env.SOLPLANET_ADMIN_API_URL ?? DEFAULT_SOLPLANET_URL
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

    private formatYear(date: Date): string {
        return `${date.getFullYear()}`
    }

    private mapPlantRecord(record: any): ProviderPlant {
        return {
            id: record?.stationid ? String(record.stationid) : randomUUID(),
            name: record?.stationname ?? record?.name ?? 'Unknown Plant',
            capacityKw: this.toNumber(record?.totalpower ?? record?.capacity),
            totalEnergy: this.toNumber(record?.etotal ?? record?.totalEnergy),
            status: this.mapPlantStatus(record?.status),
            location: this.buildLocation(record),
            createdAt: record?.createdt ? new Date(record.createdt) : undefined,
            updatedAt: record?.ludt ? new Date(typeof record.ludt === 'string' ? record.ludt.replace(' ', 'T') : record.ludt) : undefined
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
            country: record.countryStr ?? record.country,
            state: record.provinceStr ?? record.state,
            city: record.city,
            address: record.street ?? record.address
        }
    }

    private mapPlantStatus(status: unknown): ProviderPlantStatus {
        if (typeof status === 'number') {
            switch (status) {
                case 1:
                    return 'ACTIVE'
                case 0:
                    return 'INACTIVE'
                case 2:
                    return 'WARNING'
                case 3:
                    return 'ERROR'
                default:
                    return 'UNKNOWN'
            }
        }

        if (typeof status === 'string') {
            switch (status.toLowerCase()) {
                case 'active':
                case 'online':
                    return 'ACTIVE'
                case 'inactive':
                case 'offline':
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
        this.sessionCookie = undefined
        this.tokenExpiresAt = undefined
        this.sessionAccountKey = undefined
    }
}