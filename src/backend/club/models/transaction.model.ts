import { TransactionType } from "@/app/generated/prisma"
import { uuid } from "@/lib/uuid"


export class TransactionModel {
    id: string
    clientId: string
    type: TransactionType
    amount: number
    description?: string
    offerId?: string
    indicationId?: string
    createdAt: Date

    constructor(
        { id, clientId, type, amount, description, offerId, indicationId, createdAt }: {
            id?: string,
            clientId: string,
            type: TransactionType,
            amount: number,
            description?: string,
            offerId?: string,
            indicationId?: string,
            createdAt?: Date
        }
    ) {
        this.id = id ?? `transaction_${uuid()}`
        this.clientId = clientId
        this.type = type
        this.amount = amount
        this.description = description
        this.offerId = offerId
        this.indicationId = indicationId
        this.createdAt = createdAt || new Date()
    }
}
