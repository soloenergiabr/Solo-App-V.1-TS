import { IndicationModel } from "../models/indication.model"

export interface IndicationRepository {
    create(indication: IndicationModel): Promise<void>
    findById(id: string): Promise<IndicationModel | null>
    findByClientId(clientId: string, asReferrer?: boolean): Promise<IndicationModel[]>
    findByReferrerId(referrerId: string): Promise<IndicationModel[]>
    findByReferredId(referredId: string): Promise<IndicationModel[]>
    findByJestorId(jestorId: string): Promise<IndicationModel | null>
    update(indication: IndicationModel): Promise<void>
}
