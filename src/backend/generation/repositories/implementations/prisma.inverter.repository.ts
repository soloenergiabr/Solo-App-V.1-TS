import { PrismaClient } from "@/app/generated/prisma";
import { InverterModel } from "../../models/inverter.model";
import { InverterRepository } from "../inverter.repository";

export class PrismaInverterRepository implements InverterRepository {
    constructor(private prisma: PrismaClient) { }

    async create(inverter: InverterModel): Promise<void> {
        await this.prisma.inverter.create({
            data: {
                id: inverter.id,
                provider: inverter.provider,
                providerId: inverter.providerId,
                providerApiKey: inverter.providerApiKey,
                providerApiSecret: inverter.providerApiSecret,
                providerUrl: inverter.providerUrl,
                clientId: inverter.clientId || "",
            },
        });
    }

    async find(): Promise<InverterModel[]> {
        const inverters = await this.prisma.inverter.findMany({
            where: {
                deletedAt: null,
            },
        });

        return inverters.map(inverter => new InverterModel(
            inverter.id,
            inverter.provider, // Using provider as name for now
            inverter.provider,
            inverter.providerId,
            inverter.providerApiKey || undefined,
            inverter.providerApiSecret || undefined,
            inverter.providerUrl || undefined,
            inverter.clientId || undefined
        ));
    }

    async findById(id: string): Promise<InverterModel> {
        const inverter = await this.prisma.inverter.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });

        if (!inverter) {
            throw new Error("Inverter not found");
        }

        return new InverterModel(
            inverter.id,
            inverter.provider, // Using provider as name for now
            inverter.provider,
            inverter.providerId,
            inverter.providerApiKey || undefined,
            inverter.providerApiSecret || undefined,
            inverter.providerUrl || undefined,
            inverter.clientId || undefined
        );
    }

    async update(inverterModel: InverterModel): Promise<void> {
        const existingInverter = await this.prisma.inverter.findFirst({
            where: {
                id: inverterModel.id,
                deletedAt: null,
            },
        });

        if (!existingInverter) {
            throw new Error("Inverter not found");
        }

        await this.prisma.inverter.update({
            where: {
                id: inverterModel.id,
            },
            data: {
                provider: inverterModel.provider,
                providerId: inverterModel.providerId,
                providerApiKey: inverterModel.providerApiKey,
                providerApiSecret: inverterModel.providerApiSecret,
                providerUrl: inverterModel.providerUrl,
                updatedAt: new Date(),
            },
        });
    }

    async delete(id: string): Promise<void> {
        const existingInverter = await this.prisma.inverter.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });

        if (!existingInverter) {
            throw new Error("Inverter not found");
        }

        // Soft delete
        await this.prisma.inverter.update({
            where: {
                id,
            },
            data: {
                deletedAt: new Date(),
            },
        });
    }

    async findByClientId(clientId: string): Promise<InverterModel[]> {
        const inverters = await this.prisma.inverter.findMany({
            where: {
                clientId,
                deletedAt: null,
            },
        });

        return inverters.map(inverter => new InverterModel(
            inverter.id,
            inverter.provider,
            inverter.provider,
            inverter.providerId,
            inverter.providerApiKey || undefined,
            inverter.providerApiSecret || undefined,
            inverter.providerUrl || undefined,
            inverter.clientId || undefined
        ));
    }
}
