import { PrismaClient } from "@/app/generated/prisma"
import { OfferRedemptionRepository } from "../offer-redemption.repository"
import { OfferRedemptionModel, RedemptionStatus } from "../../models/offer-redemption.model"

export class PrismaOfferRedemptionRepository implements OfferRedemptionRepository {
    constructor(private prisma: PrismaClient) { }

    private mapToModel(data: any): OfferRedemptionModel {
        return new OfferRedemptionModel({
            id: data.id,
            redemptionCode: data.redemptionCode,
            offerId: data.offerId,
            clientId: data.clientId,
            status: data.status as RedemptionStatus,
            redeemedAt: data.redeemedAt,
            usedAt: data.usedAt ?? undefined,
            expiresAt: data.expiresAt ?? undefined,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            offer: data.offer ? {
                id: data.offer.id,
                title: data.offer.title,
                description: data.offer.description,
                partner: data.offer.partner,
                cost: data.offer.cost,
                discount: data.offer.discount ?? undefined,
                imageUrl: data.offer.imageUrl ?? undefined,
                confirmationCode: data.offer.confirmationCode ?? undefined,
            } : undefined,
            client: data.client ? {
                id: data.client.id,
                name: data.client.name,
            } : undefined,
        })
    }

    async create(redemption: OfferRedemptionModel): Promise<OfferRedemptionModel> {
        const data = await this.prisma.offerRedemption.create({
            data: {
                id: redemption.id,
                redemptionCode: redemption.redemptionCode,
                offerId: redemption.offerId,
                clientId: redemption.clientId,
                status: redemption.status,
                redeemedAt: redemption.redeemedAt,
                usedAt: redemption.usedAt,
                expiresAt: redemption.expiresAt,
            },
            include: {
                offer: true,
                client: true,
            }
        })
        return this.mapToModel(data)
    }

    async findById(id: string): Promise<OfferRedemptionModel | null> {
        const data = await this.prisma.offerRedemption.findUnique({
            where: { id },
            include: {
                offer: true,
                client: true,
            }
        })
        return data ? this.mapToModel(data) : null
    }

    async findByRedemptionCode(code: string): Promise<OfferRedemptionModel | null> {
        const data = await this.prisma.offerRedemption.findUnique({
            where: { redemptionCode: code },
            include: {
                offer: true,
                client: true,
            }
        })
        return data ? this.mapToModel(data) : null
    }

    async findByClientId(clientId: string): Promise<OfferRedemptionModel[]> {
        const data = await this.prisma.offerRedemption.findMany({
            where: { clientId },
            include: {
                offer: true,
                client: true,
            },
            orderBy: { redeemedAt: 'desc' }
        })
        return data.map(d => this.mapToModel(d))
    }

    async findByOfferId(offerId: string): Promise<OfferRedemptionModel[]> {
        const data = await this.prisma.offerRedemption.findMany({
            where: { offerId },
            include: {
                offer: true,
                client: true,
            },
            orderBy: { redeemedAt: 'desc' }
        })
        return data.map(d => this.mapToModel(d))
    }

    async findByClientIdAndStatus(clientId: string, status: RedemptionStatus): Promise<OfferRedemptionModel[]> {
        const data = await this.prisma.offerRedemption.findMany({
            where: { clientId, status },
            include: {
                offer: true,
                client: true,
            },
            orderBy: { redeemedAt: 'desc' }
        })
        return data.map(d => this.mapToModel(d))
    }

    async update(redemption: OfferRedemptionModel): Promise<void> {
        await this.prisma.offerRedemption.update({
            where: { id: redemption.id },
            data: {
                status: redemption.status,
                usedAt: redemption.usedAt,
                expiresAt: redemption.expiresAt,
            }
        })
    }

    async delete(id: string): Promise<void> {
        await this.prisma.offerRedemption.delete({
            where: { id }
        })
    }
}
