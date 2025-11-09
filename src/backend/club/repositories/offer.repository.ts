import { OfferModel } from "../models/offer.model"

export interface OfferRepository {
    create(offer: OfferModel): Promise<void>
    findById(id: string): Promise<OfferModel | null>
    findActive(): Promise<OfferModel[]>
    update(offer: OfferModel): Promise<void>
    delete(id: string): Promise<void>
}
