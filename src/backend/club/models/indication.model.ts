import { IndicationStatus } from "@/app/generated/prisma"
import { uuid } from "@/lib/uuid"
import { ClientModel } from "../../auth/models/client.model"

export { IndicationStatus }

export class IndicationModel {
    id: string
    referrerId: string
    referrer?: ClientModel
    referredId: string
    referred?: ClientModel
    status: IndicationStatus
    createdAt: Date
    updatedAt: Date
    jestorId?: string
    projectValue?: number

    constructor(
        { id, referrerId, referrer, referredId, referred, status, jestorId, projectValue, createdAt, updatedAt }: {
            id?: string,
            referrerId: string,
            referrer?: ClientModel,
            referredId: string,
            referred?: ClientModel,
            status: IndicationStatus,
            jestorId?: string,
            projectValue?: number,
            createdAt?: Date,
            updatedAt?: Date
        }
    ) {
        this.id = id ?? `indication_${uuid()}`
        this.referrerId = referrerId
        this.referrer = referrer
        this.referredId = referredId
        this.referred = referred
        this.status = status
        this.jestorId = jestorId
        this.projectValue = projectValue
        this.createdAt = createdAt ?? new Date()
        this.updatedAt = updatedAt ?? new Date()
    }
}