import { createHash } from "node:crypto"
import { randomUUID } from "node:crypto"
import axios from "axios"
import { InverterModel } from "../../models/inverter.model"
import { ProviderPlant, ProviderPlantStatus } from "../../models/provider-plant.model"
import { InverterApiRepository } from "../inverter-api.repository"

const DEFAULT_HOYMILES_URL = 'https://neapi.hoymiles.com'

type HoymilesRealTimeData = {
    real_power?: number
    today_eq?: number
    month_eq?: number
    year_eq?: number
    total_eq?: number
}

type HoymilesRealTimeResponse = {
    real_time_data?: HoymilesRealTimeData
}

type HoymilesStation = {
    id?: number | string
    name?: string
    capacity?: number
    status?: number | string
    address?: string
    location_lat?: number
    location_lng?: number
    create_time?: string | number
    update_time?: string | number
}

export class HoymilesInverterApiRepository extends InverterApiRepository {
    private sessionToken?: string
    private tokenExpiresAt?: number

    constructor(data?: InverterModel) { super(data) }

    override setInverterData(data: InverterModel): void {
        super.setInverterData(data)
        this.sessionToken = undefined
        this.tokenExpiresAt = undefined
    }

    async getRealTimeGeneration(): Promise<{ power: number, energy: number }> {
        const data = await this.fetchRealTimeData()
        const rt = data?.real_time_data ?? {}

        // API returns values in Wh/W — convert to kWh/kW
        const power = this.toNumber(rt.real_power) / 1000
        const energy = this.toNumber(rt.today_eq) / 1000

        return { power, energy }
    }

    async getGenerationByDay(): Promise<number> {
        const data = await this.fetchRealTimeData()
        return this.toNumber(data?.real_time_data?.today_eq) / 1000
    }

    async getGenerationByMonth(): Promise<number> {
        const data = await this.fetchRealTimeData()
        return this.toNumber(data?.real_time_data?.month_eq) / 1000
    }

    async getGenerationByYear(): Promise<number> {
        const data = await this.fetchRealTimeData()
        return this.toNumber(data?.real_time_data?.year_eq) / 1000
    }

    async getGenerationByInterval(): Promise<number> {
        return this.getGenerationByDay()
    }

    async listPlants(): Promise<ProviderPlant[]> {
        const token = await this.ensureSession()
        const baseUrl = this.resolveBaseUrl()
        const allStations: HoymilesStation[] = []
        let pageNum = 1
        const pageSize = 100

        while (true) {
            const response = await axios.post(
                `${baseUrl}/pvm/api/0/station/select_by_page`,
                { page_size: pageSize, page_num: pageNum },
                { headers: this.buildAuthHeaders(token) }
            )

            const resp = response.data
            if (resp?.status !== '0' || resp?.message !== 'success') break

            const payload = resp?.data ?? {}
            const list: HoymilesStation[] = payload?.list ?? []

            if (list.length === 0) break
            allStations.push(...list)

            const total = this.toNumber(payload?.total)
            if (allStations.length >= total || list.length < pageSize) break

            pageNum++
        }

        return allStations.map(s => this.mapStation(s))
    }

    private async fetchRealTimeData(): Promise<HoymilesRealTimeResponse> {
        const stationId = this.getStationId()
        const token = await this.ensureSession()
        const baseUrl = this.resolveBaseUrl()

        try {
            const response = await axios.post(
                `${baseUrl}/pvm-data/api/0/station/data/count_station_real_data`,
                { sid: stationId },
                { headers: this.buildAuthHeaders(token) }
            )

            const resp = response.data
            if (resp?.status !== '0' || resp?.message !== 'success') {
                throw new Error(`Hoymiles real-time data failed: ${resp?.message ?? resp?.status}`)
            }

            return resp?.data ?? {}
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status ?? 'unknown'
                const body = error.response?.data ? JSON.stringify(error.response.data) : error.message
                throw new Error(`Hoymiles real-time request failed (${status}): ${body}`)
            }
            throw error
        }
    }

    private async ensureSession(): Promise<string> {
        const isValid = this.sessionToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt

        if (isValid && this.sessionToken) {
            return this.sessionToken
        }

        const { username, password } = this.getCredentials()
        const token = await this.loginWithFallback(username, password)

        this.sessionToken = token
        // Hoymiles tokens last ~2h — refresh 5 min before expiry
        this.tokenExpiresAt = Date.now() + ((2 * 60 * 60 - 300) * 1000)

        return this.sessionToken
    }

    /**
     * Tries legacy MD5 login first.
     * Falls back to v3 unsalted (MD5 + SHA256 base64) if legacy fails.
     * Mirrors the approach used by the community HA integration.
     */
    private async loginWithFallback(username: string, password: string): Promise<string> {
        const legacyToken = await this.loginLegacy(username, password)
        if (legacyToken) return legacyToken

        const v3Token = await this.loginV3Unsalted(username, password)
        if (v3Token) return v3Token

        throw new Error('Hoymiles authentication failed — legacy and v3 strategies both failed. Check credentials.')
    }

    /**
     * Legacy login: POST /iam/pub/0/auth/login
     * Password sent as plain MD5 hash.
     */
    private async loginLegacy(username: string, password: string): Promise<string | null> {
        const baseUrl = this.resolveBaseUrl()
        const md5Password = createHash('md5').update(password).digest('hex')

        try {
            const response = await axios.post(
                `${baseUrl}/iam/pub/0/auth/login`,
                { user_name: username, password: md5Password },
                { headers: { 'Content-Type': 'application/json' } }
            )

            const resp = response.data
            if (resp?.status === '0' && resp?.message === 'success') {
                return resp?.data?.token ?? null
            }
            return null
        } catch {
            return null
        }
    }

    /**
     * Modern v3 login (unsalted variant):
     * 1. Pre-inspect to get server nonce
     * 2. Build ch = MD5(pass) + "." + base64(SHA256(pass))
     * 3. POST to /iam/pub/3/auth/login with {u, ch, n}
     */
    private async loginV3Unsalted(username: string, password: string): Promise<string | null> {
        const baseUrl = this.resolveBaseUrl()
        const headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'HomeAssistant-HoymilesCloud',
        }

        try {
            // Step 1: pre-inspection — get server nonce
            const preResp = await axios.post(
                `${baseUrl}/iam/pub/3/auth/pre-insp`,
                { u: username },
                { headers }
            )

            const preData = preResp.data
            const nonce = preData?.data?.n ?? preData?.n
            if (!nonce) return null

            // Step 2: build credential hash
            const md5Password = createHash('md5').update(password).digest('hex')
            const sha256B64 = createHash('sha256').update(password).digest('base64')
            const ch = `${md5Password}.${sha256B64}`

            // Step 3: login
            const loginResp = await axios.post(
                `${baseUrl}/iam/pub/3/auth/login`,
                { u: username, ch, n: nonce },
                { headers }
            )

            const resp = loginResp.data
            if (resp?.status === '0' && resp?.message === 'success') {
                return resp?.data?.token ?? null
            }
            return null
        } catch {
            return null
        }
    }

    private buildAuthHeaders(token: string): Record<string, string> {
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token,
        }
    }

    private getStationId(): number {
        const inverter = this.requireInverterData()
        if (!inverter.providerId) {
            throw new Error('Hoymiles station ID (providerId) is not configured on this inverter')
        }
        return Number(inverter.providerId)
    }

    private getCredentials(): { username: string, password: string } {
        const username = this.data?.providerApiKey ?? process.env.HOYMILES_ADMIN_ACCOUNT
        const password = this.data?.providerApiSecret ?? process.env.HOYMILES_ADMIN_PASSWORD

        if (!username || !password) {
            throw new Error('Hoymiles credentials not configured. Set providerApiKey/providerApiSecret on the inverter or HOYMILES_ADMIN_ACCOUNT/HOYMILES_ADMIN_PASSWORD in .env')
        }

        return { username, password }
    }

    private resolveBaseUrl(): string {
        const url = this.data?.providerUrl ?? process.env.HOYMILES_API_URL ?? DEFAULT_HOYMILES_URL
        return url.endsWith('/') ? url.slice(0, -1) : url
    }

    private mapStation(record: HoymilesStation): ProviderPlant {
        return {
            id: record?.id ? String(record.id) : randomUUID(),
            name: record?.name ?? 'Unknown Plant',
            capacityKw: this.toNumber(record?.capacity) / 1000,
            totalEnergy: 0,
            status: this.mapStatus(record?.status),
            location: this.buildLocation(record),
            createdAt: this.parseTimestamp(record?.create_time),
            updatedAt: this.parseTimestamp(record?.update_time),
        }
    }

    private mapStatus(status: unknown): ProviderPlantStatus {
        const value = typeof status === 'string' ? status.toUpperCase() : String(status ?? '')
        switch (value) {
            case '1':
            case 'ONLINE':
            case 'NORMAL':
                return 'ACTIVE'
            case '0':
            case 'OFFLINE':
                return 'INACTIVE'
            default:
                return 'UNKNOWN'
        }
    }

    private buildLocation(record: HoymilesStation) {
        const latitude = this.toNumber(record?.location_lat)
        const longitude = this.toNumber(record?.location_lng)
        const address = record?.address

        if (!latitude && !longitude && !address) return undefined

        return { latitude, longitude, address }
    }

    private parseTimestamp(value: unknown): Date | undefined {
        if (!value) return undefined
        if (typeof value === 'number') {
            const isSeconds = String(value).length <= 10
            return new Date(isSeconds ? value * 1000 : value)
        }
        if (typeof value === 'string') {
            const d = new Date(value)
            if (!isNaN(d.getTime())) return d
        }
        return undefined
    }

    private toNumber(value: unknown): number {
        if (typeof value === 'number' && Number.isFinite(value)) return value
        if (typeof value === 'string') {
            const parsed = Number.parseFloat(value.replace(/,/g, '.'))
            if (Number.isFinite(parsed)) return parsed
        }
        return 0
    }
}
