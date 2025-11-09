import { PrismaClient } from "@/app/generated/prisma";
import { IndicationModel, IndicationStatus } from "../../models/indication.model";
import { IndicationRepository } from "../indication.repository";

export class PrismaIndicationRepository implements IndicationRepository {
    constructor(private prisma: PrismaClient) { }

    async create(indication: IndicationModel): Promise<void> {
        await this.prisma.indication.create({
            data: {
                id: indication.id,
                referrerId: indication.referrerId,
                referredId: indication.referredId,
                status: indication.status,
                createdAt: indication.createdAt,
                updatedAt: indication.updatedAt,
            },
        });
    }

    async findById(id: string): Promise<IndicationModel | null> {
        const indication = await this.prisma.indication.findUnique({
            where: { id },
            include: {
                referrer: true,
                referred: true,
            },
        });

        if (!indication) return null;

        return new IndicationModel({
            id: indication.id,
            referrerId: indication.referrerId,
            referrer: indication.referrer ? {
                id: indication.referrer.id,
                name: indication.referrer.name,
                email: indication.referrer.email,
                cpfCnpj: indication.referrer.cpfCnpj,
                phone: indication.referrer.phone || undefined,
                address: indication.referrer.address || undefined,
                avgEnergyCost: indication.referrer.avgEnergyCost || undefined,
                enelInvoiceFile: indication.referrer.enelInvoiceFile || undefined,
                indicationCode: indication.referrer.indicationCode,
                status: indication.referrer.status as any,
                createdAt: indication.referrer.createdAt,
                updatedAt: indication.referrer.updatedAt,
            } : undefined,
            referredId: indication.referredId,
            referred: indication.referred ? {
                id: indication.referred.id,
                name: indication.referred.name,
                email: indication.referred.email,
                cpfCnpj: indication.referred.cpfCnpj,
                phone: indication.referred.phone || undefined,
                address: indication.referred.address || undefined,
                avgEnergyCost: indication.referred.avgEnergyCost || undefined,
                enelInvoiceFile: indication.referred.enelInvoiceFile || undefined,
                indicationCode: indication.referred.indicationCode,
                status: indication.referred.status as any,
                createdAt: indication.referred.createdAt,
                updatedAt: indication.referred.updatedAt,
            } : undefined,
            status: indication.status as IndicationStatus,
            createdAt: indication.createdAt,
            updatedAt: indication.updatedAt,
        });
    }

    async findByClientId(clientId: string, asReferrer: boolean = true): Promise<IndicationModel[]> {
        const indications = await this.prisma.indication.findMany({
            where: asReferrer ? { referrerId: clientId } : { referredId: clientId },
            include: {
                referrer: true,
                referred: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return indications.map(indication => new IndicationModel({
            id: indication.id,
            referrerId: indication.referrerId,
            referrer: indication.referrer ? {
                id: indication.referrer.id,
                name: indication.referrer.name,
                email: indication.referrer.email,
                cpfCnpj: indication.referrer.cpfCnpj,
                phone: indication.referrer.phone || undefined,
                address: indication.referrer.address || undefined,
                avgEnergyCost: indication.referrer.avgEnergyCost || undefined,
                enelInvoiceFile: indication.referrer.enelInvoiceFile || undefined,
                indicationCode: indication.referrer.indicationCode,
                status: indication.referrer.status as any,
                createdAt: indication.referrer.createdAt,
                updatedAt: indication.referrer.updatedAt,
            } : undefined,
            referredId: indication.referredId,
            referred: indication.referred ? {
                id: indication.referred.id,
                name: indication.referred.name,
                email: indication.referred.email,
                cpfCnpj: indication.referred.cpfCnpj,
                phone: indication.referred.phone || undefined,
                address: indication.referred.address || undefined,
                avgEnergyCost: indication.referred.avgEnergyCost || undefined,
                enelInvoiceFile: indication.referred.enelInvoiceFile || undefined,
                indicationCode: indication.referred.indicationCode,
                status: indication.referred.status as any,
                createdAt: indication.referred.createdAt,
                updatedAt: indication.referred.updatedAt,
            } : undefined,
            status: indication.status as IndicationStatus,
            createdAt: indication.createdAt,
            updatedAt: indication.updatedAt,
        }));
    }

    async findByReferrerId(referrerId: string): Promise<IndicationModel[]> {
        return this.findByClientId(referrerId, true);
    }

    async findByReferredId(referredId: string): Promise<IndicationModel[]> {
        return this.findByClientId(referredId, false);
    }

    async update(indication: IndicationModel): Promise<void> {
        await this.prisma.indication.update({
            where: { id: indication.id },
            data: {
                status: indication.status,
                updatedAt: new Date(),
            },
        });
    }
}
