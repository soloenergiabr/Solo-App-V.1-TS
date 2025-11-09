import { uuid } from "@/lib/uuid"

export class OfferModel {
    id: string
    title: string
    description: string
    partner: string
    cost: number
    discount?: string
    imageUrl?: string
    validFrom?: Date
    validTo?: Date
    isActive: boolean
    createdAt: Date
    updatedAt: Date

    constructor(
        { id, title, description, partner, cost, discount, imageUrl, validFrom, validTo, isActive, createdAt, updatedAt }: {
            id?: string,
            title: string,
            description: string,
            partner: string,
            cost: number,
            discount?: string,
            imageUrl?: string,
            validFrom?: Date,
            validTo?: Date,
            isActive?: boolean,
            createdAt?: Date,
            updatedAt?: Date
        }
    ) {
        this.id = id ?? `offer_${uuid()}`
        this.title = title
        this.description = description
        this.partner = partner
        this.cost = cost
        this.discount = discount
        this.imageUrl = imageUrl
        this.validFrom = validFrom
        this.validTo = validTo
        this.isActive = isActive ?? true
        this.createdAt = createdAt || new Date()
        this.updatedAt = updatedAt || new Date()
    }
}
