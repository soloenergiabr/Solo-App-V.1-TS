import { PrismaClient } from "@/app/generated/prisma";
import { OfferModel } from "../../models/offer.model";
import { OfferRepository } from "../offer.repository";

export class PrismaOfferRepository implements OfferRepository {
    constructor(private prisma: PrismaClient) { }

    async create(offer: OfferModel): Promise<OfferModel> {
        const createdOffer = await this.prisma.offer.create({
            data: {
                id: offer.id,
                title: offer.title,
                description: offer.description,
                partner: offer.partner,
                cost: offer.cost,
                discount: offer.discount,
                imageUrl: offer.imageUrl,
                validFrom: offer.validFrom,
                validTo: offer.validTo,
                isActive: offer.isActive,
                createdAt: offer.createdAt,
                updatedAt: offer.updatedAt,
            },
        });

        return new OfferModel({
            id: createdOffer.id,
            title: createdOffer.title,
            description: createdOffer.description,
            partner: createdOffer.partner,
            cost: createdOffer.cost,
            discount: createdOffer.discount || undefined,
            imageUrl: createdOffer.imageUrl || undefined,
            validFrom: createdOffer.validFrom || undefined,
            validTo: createdOffer.validTo || undefined,
            isActive: createdOffer.isActive,
            createdAt: createdOffer.createdAt,
            updatedAt: createdOffer.updatedAt,
        });
    }

    async findById(id: string): Promise<OfferModel | null> {
        const offer = await this.prisma.offer.findUnique({
            where: { id },
        });

        if (!offer) return null;

        return new OfferModel({
            id: offer.id,
            title: offer.title,
            description: offer.description,
            partner: offer.partner,
            cost: offer.cost,
            discount: offer.discount || undefined,
            imageUrl: offer.imageUrl || undefined,
            validFrom: offer.validFrom || undefined,
            validTo: offer.validTo || undefined,
            isActive: offer.isActive,
            createdAt: offer.createdAt,
            updatedAt: offer.updatedAt,
        });
    }

    async findActive(): Promise<OfferModel[]> {
        const offers = await this.prisma.offer.findMany({
            where: {
                isActive: true,
                OR: [
                    { validTo: null },
                    { validTo: { gte: new Date() } },
                ],
            },
            orderBy: { createdAt: 'desc' },
        });

        return offers.map(offer => new OfferModel({
            id: offer.id,
            title: offer.title,
            description: offer.description,
            partner: offer.partner,
            cost: offer.cost,
            discount: offer.discount || undefined,
            imageUrl: offer.imageUrl || undefined,
            validFrom: offer.validFrom || undefined,
            validTo: offer.validTo || undefined,
            isActive: offer.isActive,
            createdAt: offer.createdAt,
            updatedAt: offer.updatedAt,
        }));
    }

    async update(offer: OfferModel): Promise<void> {
        await this.prisma.offer.update({
            where: { id: offer.id },
            data: {
                title: offer.title,
                description: offer.description,
                partner: offer.partner,
                cost: offer.cost,
                discount: offer.discount,
                imageUrl: offer.imageUrl,
                validFrom: offer.validFrom,
                validTo: offer.validTo,
                isActive: offer.isActive,
                updatedAt: new Date(),
            },
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.offer.delete({
            where: { id },
        });
    }
}
