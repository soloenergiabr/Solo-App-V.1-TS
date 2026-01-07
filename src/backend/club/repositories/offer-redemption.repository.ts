import { OfferRedemptionModel, RedemptionStatus } from "../models/offer-redemption.model"

export interface OfferRedemptionRepository {
    create(redemption: OfferRedemptionModel): Promise<OfferRedemptionModel>
    findById(id: string): Promise<OfferRedemptionModel | null>
    findByRedemptionCode(code: string): Promise<OfferRedemptionModel | null>
    findByClientId(clientId: string): Promise<OfferRedemptionModel[]>
    findByOfferId(offerId: string): Promise<OfferRedemptionModel[]>
    findByClientIdAndStatus(clientId: string, status: RedemptionStatus): Promise<OfferRedemptionModel[]>
    update(redemption: OfferRedemptionModel): Promise<void>
    delete(id: string): Promise<void>
}
