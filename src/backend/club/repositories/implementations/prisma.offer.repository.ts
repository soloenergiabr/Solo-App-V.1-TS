import { PrismaClient, Offer } from "@/app/generated/prisma";
import { OfferModel } from "../../models/offer.model";
import { OfferRepository } from "../offer.repository";

const toModel = (offer: Offer) => new OfferModel({
    ...offer,
    discount: offer.discount || undefined,
    imageUrl: offer.imageUrl || undefined,
    confirmationCode: offer.confirmationCode || undefined,
});

const toData = (offer: OfferModel) => ({
    title: offer.title,
    description: offer.description,
    partner: offer.partner,
    cost: offer.cost,
    discount: offer.discount,
    imageUrl: offer.imageUrl,
    confirmationCode: offer.confirmationCode,
    maxRedemptionsPerClient: offer.maxRedemptionsPerClient,
    externalUrl: offer.externalUrl,
    originalPrice: offer.originalPrice,
    promoPrice: offer.promoPrice,
    validFrom: offer.validFrom,
    validTo: offer.validTo,
    isActive: offer.isActive,
});

export class PrismaOfferRepository implements OfferRepository {
    constructor(private prisma: PrismaClient) { }

    async create(offer: OfferModel): Promise<OfferModel> {
        const createdOffer = await this.prisma.offer.create({
            data: { id: offer.id, ...toData(offer), createdAt: offer.createdAt, updatedAt: offer.updatedAt },
        });
        return toModel(createdOffer);
    }

    async findById(id: string): Promise<OfferModel | null> {
        const offer = await this.prisma.offer.findUnique({ where: { id } });
        return offer ? toModel(offer) : null;
    }

    /** Ofertas que o cliente vê: ativas e dentro da validade (nem expiradas, nem agendadas). */
    async findActive(): Promise<OfferModel[]> {
        const now = new Date();
        const offers = await this.prisma.offer.findMany({
            where: {
                isActive: true,
                AND: [
                    { OR: [{ validTo: null }, { validTo: { gte: now } }] },
                    { OR: [{ validFrom: null }, { validFrom: { lte: now } }] },
                ],
            },
            orderBy: { createdAt: 'desc' },
        });
        return offers.map(toModel);
    }

    async update(offer: OfferModel): Promise<void> {
        await this.prisma.offer.update({
            where: { id: offer.id },
            data: { ...toData(offer), updatedAt: new Date() },
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.offer.delete({ where: { id } });
    }
}
