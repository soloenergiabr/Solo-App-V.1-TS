export const ADMIN_INVERTER_PROVIDERS = ['solis', 'solplanet'] as const

export type AdminInverterProviderType = typeof ADMIN_INVERTER_PROVIDERS[number]

export type ProviderPlantStatus = 'ACTIVE' | 'INACTIVE' | 'WARNING' | 'ERROR' | 'UNKNOWN'

export type ProviderPlantLocation = {
    latitude?: number
    longitude?: number
    country?: string
    state?: string
    city?: string
    address?: string
}

export type ProviderPlant = {
    id: string
    name: string
    capacityKw?: number
    totalEnergy?: number
    status: ProviderPlantStatus
    location?: ProviderPlantLocation
    createdAt?: Date
    updatedAt?: Date
}

export type ProviderSummary = {
    provider: AdminInverterProviderType
    label: string
    supportsPlantListing: boolean
    configured: boolean
}
