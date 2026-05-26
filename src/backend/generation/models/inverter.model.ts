export type InverterOperationalData = {
    plantId?: string
    providerPlantId?: string
    providerPlantName?: string
    providerStatus?: string
    providerConfig?: unknown
    providerMetadata?: unknown
    serialNumber?: string
    manufacturer?: string
    modelName?: string
    firmwareVersion?: string
    nominalPowerKw?: number
    timezone?: string
    syncEnabled?: boolean
    syncIntervalMinutes?: number
    lastSyncAt?: Date
    lastSuccessfulSyncAt?: Date
    lastSyncStatus?: string
    lastSyncError?: string
    installedAt?: Date
    commissionedAt?: Date
}

export class InverterModel {
    public plantId?: string
    public providerPlantId?: string
    public providerPlantName?: string
    public providerStatus?: string
    public providerConfig?: unknown
    public providerMetadata?: unknown
    public serialNumber?: string
    public manufacturer?: string
    public modelName?: string
    public firmwareVersion?: string
    public nominalPowerKw?: number
    public timezone?: string
    public syncEnabled: boolean
    public syncIntervalMinutes?: number
    public lastSyncAt?: Date
    public lastSuccessfulSyncAt?: Date
    public lastSyncStatus?: string
    public lastSyncError?: string
    public installedAt?: Date
    public commissionedAt?: Date

    constructor(
        public id: string,
        public name: string,
        public provider: string,
        public providerId: string,
        public providerApiKey?: string,
        public providerApiSecret?: string,
        public providerUrl?: string,
        public clientId?: string,
        operationalData: InverterOperationalData = {}
    ) {
        this.plantId = operationalData.plantId
        this.providerPlantId = operationalData.providerPlantId
        this.providerPlantName = operationalData.providerPlantName
        this.providerStatus = operationalData.providerStatus
        this.providerConfig = operationalData.providerConfig
        this.providerMetadata = operationalData.providerMetadata
        this.serialNumber = operationalData.serialNumber
        this.manufacturer = operationalData.manufacturer
        this.modelName = operationalData.modelName
        this.firmwareVersion = operationalData.firmwareVersion
        this.nominalPowerKw = operationalData.nominalPowerKw
        this.timezone = operationalData.timezone
        this.syncEnabled = operationalData.syncEnabled ?? true
        this.syncIntervalMinutes = operationalData.syncIntervalMinutes
        this.lastSyncAt = operationalData.lastSyncAt
        this.lastSuccessfulSyncAt = operationalData.lastSuccessfulSyncAt
        this.lastSyncStatus = operationalData.lastSyncStatus
        this.lastSyncError = operationalData.lastSyncError
        this.installedAt = operationalData.installedAt
        this.commissionedAt = operationalData.commissionedAt
    }
}
