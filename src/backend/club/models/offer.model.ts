import { uuid } from "@/lib/uuid"

type OfferProps = {
    id?: string
    title: string
    description: string
    partner: string
    cost: number
    discount?: string
    imageUrl?: string
    confirmationCode?: string
    maxRedemptionsPerClient?: number
    externalUrl?: string | null
    originalPrice?: number | null
    promoPrice?: number | null
    validFrom?: Date | null
    validTo?: Date | null
    isActive?: boolean
    createdAt?: Date
    updatedAt?: Date
}

export class OfferModel {
    id: string
    title: string
    description: string
    partner: string
    cost: number
    discount?: string
    imageUrl?: string
    confirmationCode?: string
    maxRedemptionsPerClient: number
    externalUrl: string | null
    originalPrice: number | null
    promoPrice: number | null
    validFrom: Date | null
    validTo: Date | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date

    constructor(props: OfferProps) {
        this.id = props.id ?? `offer_${uuid()}`
        this.title = props.title
        this.description = props.description
        this.partner = props.partner
        this.cost = props.cost
        this.discount = props.discount
        this.imageUrl = props.imageUrl
        this.confirmationCode = props.confirmationCode
        this.maxRedemptionsPerClient = props.maxRedemptionsPerClient ?? 1
        this.externalUrl = props.externalUrl ?? null
        this.originalPrice = props.originalPrice ?? null
        this.promoPrice = props.promoPrice ?? null
        this.validFrom = props.validFrom ?? null
        this.validTo = props.validTo ?? null
        this.isActive = props.isActive ?? true
        this.createdAt = props.createdAt || new Date()
        this.updatedAt = props.updatedAt || new Date()
    }
}
