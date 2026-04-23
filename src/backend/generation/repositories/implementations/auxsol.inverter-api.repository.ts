import { randomUUID } from "node:crypto"
import axios, { AxiosError, AxiosRequestConfig } from "axios"
import { InverterModel } from "../../models/inverter.model"
import { ProviderPlant, ProviderPlantStatus } from "../../models/provider-plant.model"
import { InverterApiRepository } from "../inverter-api.repository"

const DEFAULT_AUXSOL_URL = 'https://eu.auxsolcloud.com/auxsol-api'
const SUCCESS_CODE = 'AWX-0000'
const AUTH_FAILURE_CODES = new Set(['AWX-2000', 'AWX-2001'])
const TOKEN_SAFETY_BUFFER_SECONDS = 60

type AuxsolEnvelope<T> = {
    code?: string
    msg?: string | null
    data?: T
}

type AuxsolTokenData = {
    access_token?: string
    expires_in?: number
}

type AuxsolEnergyData = {
    flh?: number | null
    power?: number | null
    y?: number | null
    yt?: number | null
    ym?: number | null
    yy?: number | null
    co2?: number | null
    treePlants?: number | null
}

type AuxsolInverterRealTime = {
    sn?: string
    dt?: string
    lastCommTime?: string
    energyData?: AuxsolEnergyData
}

type AuxsolPlantRow = {
    plantId?: number | string
    plantName?: string
    address?: string
    capacity?: number | string
    currentPower?: number | string | null
    todayYield?: number | string | null
    monthlyYield?: number | string | null
    totalYield?: number | string | null
    status?: string
    createTime?: string
    dt?: string
}

type AuxsolListResponse<T> = {
    total?: number
    rows?: T[]
}

type CachedToken = {
    token: string
    expiresAt: number
}

const tokenCache = new Map<string, CachedToken>()

export class AuxsolInverterApiRepository extends InverterApiRepository {
    constructor(data?: InverterModel) { super(data) }

    override setInverterData(data: InverterModel): void {
        super.setInverterData(data)
    }

    async getRealTimeGeneration(): Promise<{ power: number, energy: number }> {
        const energy = await this.fetchInverterEnergyData()
        return {
            power: this.toNumber(energy?.power),
            energy: this.toNumber(energy?.y),
        }
    }

    async getGenerationByDay(): Promise<number> {
        const energy = await this.fetchInverterEnergyData()
        return this.toNumber(energy?.y)
    }

    async getGenerationByMonth(): Promise<number> {
        const energy = await this.fetchInverterEnergyData()
        return this.toNumber(energy?.ym)
    }

    async getGenerationByYear(): Promise<number> {
        const energy = await this.fetchInverterEnergyData()
        return this.toNumber(energy?.yy)
    }

    async getGenerationByInterval(): Promise<number> {
        return this.getGenerationByDay()
    }

    async listPlants(): Promise<ProviderPlant[]> {
        const all: AuxsolPlantRow[] = []
        const pageSize = 50
        let pageNum = 1

        while (true) {
            const envelope = await this.request<AuxsolListResponse<AuxsolPlantRow>>({
                method: 'GET',
                url: '/archive/plant/list',
                params: { pageSize, pageNum },
            })

            const rows = envelope?.rows ?? []
            if (rows.length === 0) break
            all.push(...rows)

            const total = this.toNumber(envelope?.total)
            if (all.length >= total || rows.length < pageSize) break

            pageNum++
        }

        return all.map(row => this.mapPlant(row))
    }

    private async fetchInverterEnergyData(): Promise<AuxsolEnergyData | undefined> {
        const sn = this.getInverterSn()
        const envelope = await this.request<AuxsolInverterRealTime>({
            method: 'GET',
            url: `/analysis/inverterReport/findInverterRealTimeInfoBySn/${encodeURIComponent(sn)}`,
        })
        return envelope?.energyData
    }

    private async request<T>(config: AxiosRequestConfig): Promise<T | undefined> {
        const inverter = this.requireInverterData()
        const baseUrl = this.resolveBaseUrl(inverter)
        const token = await this.ensureToken(inverter, baseUrl)

        const response = await this.callWithRetry<AuxsolEnvelope<T>>({
            ...config,
            baseURL: baseUrl,
            headers: {
                ...(config.headers ?? {}),
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${token}`,
            },
        })

        return this.unwrap<T>(response, config)
    }

    private async ensureToken(inverter: InverterModel, baseUrl: string): Promise<string> {
        const { appId, appSecret } = this.getCredentials(inverter)
        const cacheKey = `auxsol:${appId}`
        const cached = tokenCache.get(cacheKey)

        if (cached && cached.expiresAt > Date.now()) {
            return cached.token
        }

        const response = await this.callWithRetry<AuxsolEnvelope<AuxsolTokenData>>({
            method: 'POST',
            baseURL: baseUrl,
            url: '/auth/token',
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            data: { app_id: appId, app_secret: appSecret, lang: 'en-US' },
        })

        const tokenData = this.unwrapAuth(response)
        if (!tokenData?.access_token) {
            throw new Error('AUXSOL auth response missing access_token')
        }

        const expiresInSeconds = this.toNumber(tokenData.expires_in) || 43200
        const ttlMs = Math.max(60, expiresInSeconds - TOKEN_SAFETY_BUFFER_SECONDS) * 1000

        tokenCache.set(cacheKey, {
            token: tokenData.access_token,
            expiresAt: Date.now() + ttlMs,
        })

        return tokenData.access_token
    }

    private async callWithRetry<T>(config: AxiosRequestConfig, attempt = 1): Promise<T> {
        const maxAttempts = 3
        const baseDelay = 500
        const cap = 5000

        try {
            const { data } = await axios.request<T>(config)
            return data
        } catch (error) {
            if (axios.isAxiosError(error) && this.isRetriable(error) && attempt < maxAttempts) {
                const delay = Math.min(cap, baseDelay * Math.pow(2, attempt - 1))
                await this.sleep(delay)
                return this.callWithRetry<T>(config, attempt + 1)
            }
            this.rethrowAxios(error, config)
        }
    }

    private rethrowAxios(error: unknown, config: AxiosRequestConfig): never {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status ?? 'unknown'
            const safeUrl = `${config.baseURL ?? ''}${config.url ?? ''}`
            const body = error.response?.data ? this.redactBody(error.response.data) : error.message
            throw new Error(`AUXSOL request failed (${status}) at ${safeUrl}: ${body}`)
        }
        throw error
    }

    private isRetriable(error: AxiosError): boolean {
        if (!error.response) return true
        const status = error.response.status
        return status >= 500 && status < 600
    }

    private unwrap<T>(envelope: AuxsolEnvelope<T> | undefined, config: AxiosRequestConfig): T | undefined {
        if (!envelope) return undefined
        if (envelope.code && envelope.code !== SUCCESS_CODE) {
            const where = `${config.method ?? 'GET'} ${config.url ?? ''}`
            throw new Error(`AUXSOL upstream error ${envelope.code} (${envelope.msg ?? 'no msg'}) at ${where}`)
        }
        return envelope.data
    }

    private unwrapAuth(envelope: AuxsolEnvelope<AuxsolTokenData>): AuxsolTokenData | undefined {
        if (envelope?.code && envelope.code !== SUCCESS_CODE) {
            if (AUTH_FAILURE_CODES.has(envelope.code)) {
                throw new Error(`AUXSOL authentication failed: ${envelope.code} (${envelope.msg ?? 'no msg'})`)
            }
            throw new Error(`AUXSOL auth upstream error ${envelope.code} (${envelope.msg ?? 'no msg'})`)
        }
        return envelope.data
    }

    private getInverterSn(): string {
        const inverter = this.requireInverterData()
        if (!inverter.providerId) {
            throw new Error('AUXSOL inverter SN (providerId) is not configured on this inverter')
        }
        return inverter.providerId
    }

    private getCredentials(inverter: InverterModel): { appId: string, appSecret: string } {
        const appId = inverter.providerApiKey ?? process.env.AUXSOL_APP_ID
        const appSecret = inverter.providerApiSecret ?? process.env.AUXSOL_APP_SECRET

        if (!appId || !appSecret) {
            throw new Error('AUXSOL credentials not configured. Set providerApiKey/providerApiSecret on the inverter or AUXSOL_APP_ID/AUXSOL_APP_SECRET in .env')
        }

        return { appId, appSecret }
    }

    private resolveBaseUrl(inverter: InverterModel): string {
        const url = inverter.providerUrl ?? process.env.AUXSOL_BASE_URL ?? DEFAULT_AUXSOL_URL
        return url.endsWith('/') ? url.slice(0, -1) : url
    }

    private mapPlant(row: AuxsolPlantRow): ProviderPlant {
        return {
            id: row?.plantId ? String(row.plantId) : randomUUID(),
            name: row?.plantName ?? 'Unknown Plant',
            capacityKw: this.toOptionalNumber(row?.capacity),
            totalEnergy: this.toOptionalNumber(row?.totalYield),
            status: this.mapStatus(row?.status),
            location: row?.address ? { address: row.address } : undefined,
            createdAt: this.parseDate(row?.createTime),
            updatedAt: this.parseDate(row?.dt),
        }
    }

    private mapStatus(status: unknown): ProviderPlantStatus {
        switch (status) {
            case '01':
                return 'ACTIVE'
            case '02':
                return 'INACTIVE'
            case '03':
                return 'WARNING'
            default:
                return 'UNKNOWN'
        }
    }

    private parseDate(value: unknown): Date | undefined {
        if (typeof value !== 'string' || !value) return undefined
        const d = new Date(value)
        return Number.isNaN(d.getTime()) ? undefined : d
    }

    private toNumber(value: unknown): number {
        if (typeof value === 'number' && Number.isFinite(value)) return value
        if (typeof value === 'string') {
            const parsed = Number.parseFloat(value)
            if (Number.isFinite(parsed)) return parsed
        }
        return 0
    }

    private toOptionalNumber(value: unknown): number | undefined {
        if (typeof value === 'number' && Number.isFinite(value)) return value
        if (typeof value === 'string') {
            const parsed = Number.parseFloat(value)
            if (Number.isFinite(parsed)) return parsed
        }
        return undefined
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    private redactBody(body: unknown): string {
        try {
            const str = typeof body === 'string' ? body : JSON.stringify(body)
            return str
                .replace(/("?app_secret"?\s*[:=]\s*")[^"]*(")/gi, '$1[REDACTED]$2')
                .replace(/("?password"?\s*[:=]\s*")[^"]*(")/gi, '$1[REDACTED]$2')
                .replace(/(Bearer\s+)[A-Za-z0-9\-._~+/=]+/g, '$1[REDACTED]')
        } catch {
            return '[unserializable body]'
        }
    }
}
