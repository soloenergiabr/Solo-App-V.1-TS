import { uuid } from "@/lib/uuid"

export type RedemptionStatus = 'pending' | 'used' | 'expired'

// Generate a unique 6-character alphanumeric code
function generateRedemptionCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar chars (0,O,1,I)
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export class OfferRedemptionModel {
    id: string
    redemptionCode: string
    offerId: string
    clientId: string
    status: RedemptionStatus
    redeemedAt: Date
    usedAt?: Date
    expiresAt?: Date
    createdAt: Date
    updatedAt: Date

    // Optional relations for display
    offer?: {
        id: string
        title: string
        description: string
        partner: string
        cost: number
        discount?: string
        imageUrl?: string
        confirmationCode?: string
    }
    client?: {
        id: string
        name: string
    }

    constructor({
        id,
        redemptionCode,
        offerId,
        clientId,
        status,
        redeemedAt,
        usedAt,
        expiresAt,
        createdAt,
        updatedAt,
        offer,
        client
    }: {
        id?: string
        redemptionCode?: string
        offerId: string
        clientId: string
        status?: RedemptionStatus
        redeemedAt?: Date
        usedAt?: Date
        expiresAt?: Date
        createdAt?: Date
        updatedAt?: Date
        offer?: OfferRedemptionModel['offer']
        client?: OfferRedemptionModel['client']
    }) {
        this.id = id ?? `redemption_${uuid()}`
        this.redemptionCode = redemptionCode ?? generateRedemptionCode()
        this.offerId = offerId
        this.clientId = clientId
        this.status = status ?? 'pending'
        this.redeemedAt = redeemedAt || new Date()
        this.usedAt = usedAt
        this.expiresAt = expiresAt
        this.createdAt = createdAt || new Date()
        this.updatedAt = updatedAt || new Date()
        this.offer = offer
        this.client = client
    }
}
