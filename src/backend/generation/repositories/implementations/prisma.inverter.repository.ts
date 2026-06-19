import { Prisma, PrismaClient } from "@/app/generated/prisma";
import { InverterModel } from "../../models/inverter.model";
import { InverterRepository } from "../inverter.repository";
import { encrypt, decrypt, isEncrypted } from "@/backend/crypto/encryption";

export class PrismaInverterRepository implements InverterRepository {
    constructor(private prisma: PrismaClient) { }

    async create(inverter: InverterModel): Promise<void> {
        const encryptedApiKey = inverter.providerApiKey
            ? (isEncrypted(inverter.providerApiKey) ? inverter.providerApiKey : encrypt(inverter.providerApiKey))
            : undefined;
        const encryptedApiSecret = inverter.providerApiSecret
            ? (isEncrypted(inverter.providerApiSecret) ? inverter.providerApiSecret : encrypt(inverter.providerApiSecret))
            : undefined;

        await this.prisma.inverter.create({
            data: {
                id: inverter.id,
                name: inverter.name,
                provider: inverter.provider,
                providerId: inverter.providerId,
                providerApiKey: encryptedApiKey,
                providerApiSecret: encryptedApiSecret,
                providerUrl: inverter.providerUrl,
                providerPlantId: inverter.providerPlantId,
                providerPlantName: inverter.providerPlantName,
                providerStatus: inverter.providerStatus,
                providerConfig: inverter.providerConfig as any,
                providerMetadata: inverter.providerMetadata as any,
                serialNumber: inverter.serialNumber,
                manufacturer: inverter.manufacturer,
                modelName: inverter.modelName,
                firmwareVersion: inverter.firmwareVersion,
                nominalPowerKw: inverter.nominalPowerKw,
                timezone: inverter.timezone,
                syncEnabled: inverter.syncEnabled,
                syncIntervalMinutes: inverter.syncIntervalMinutes,
                lastSyncAt: inverter.lastSyncAt,
                lastSuccessfulSyncAt: inverter.lastSuccessfulSyncAt,
                lastSyncStatus: inverter.lastSyncStatus,
                lastSyncError: inverter.lastSyncError,
                installedAt: inverter.installedAt,
                commissionedAt: inverter.commissionedAt,
                clientId: inverter.clientId || "",
                plantId: inverter.plantId,
            },
        });
    }

    async find(): Promise<InverterModel[]> {
        const inverters = await this.prisma.inverter.findMany({
            where: {
                deletedAt: null,
            },
        });

        return inverters.map(inverter => this.toModel(inverter));
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

        return this.toModel(inverter);
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

        const encryptedApiKey = inverterModel.providerApiKey
            ? (isEncrypted(inverterModel.providerApiKey) ? inverterModel.providerApiKey : encrypt(inverterModel.providerApiKey))
            : undefined;
        const encryptedApiSecret = inverterModel.providerApiSecret
            ? (isEncrypted(inverterModel.providerApiSecret) ? inverterModel.providerApiSecret : encrypt(inverterModel.providerApiSecret))
            : undefined;

        await this.prisma.inverter.update({
            where: {
                id: inverterModel.id,
            },
            data: {
                name: inverterModel.name,
                provider: inverterModel.provider,
                providerId: inverterModel.providerId,
                providerApiKey: encryptedApiKey,
                providerApiSecret: encryptedApiSecret,
                providerUrl: inverterModel.providerUrl,
                providerPlantId: inverterModel.providerPlantId,
                providerPlantName: inverterModel.providerPlantName,
                providerStatus: inverterModel.providerStatus,
                providerConfig: inverterModel.providerConfig as any,
                providerMetadata: inverterModel.providerMetadata as any,
                serialNumber: inverterModel.serialNumber,
                manufacturer: inverterModel.manufacturer,
                modelName: inverterModel.modelName,
                firmwareVersion: inverterModel.firmwareVersion,
                nominalPowerKw: inverterModel.nominalPowerKw,
                timezone: inverterModel.timezone,
                syncEnabled: inverterModel.syncEnabled,
                syncIntervalMinutes: inverterModel.syncIntervalMinutes,
                lastSyncAt: inverterModel.lastSyncAt,
                lastSuccessfulSyncAt: inverterModel.lastSuccessfulSyncAt,
                lastSyncStatus: inverterModel.lastSyncStatus,
                lastSyncError: inverterModel.lastSyncError,
                installedAt: inverterModel.installedAt,
                commissionedAt: inverterModel.commissionedAt,
                plantId: inverterModel.plantId,
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

        return inverters.map(inverter => this.toModel(inverter));
    }

    private toModel(inverter: Prisma.InverterGetPayload<{}>): InverterModel {
        const decryptedApiKey = inverter.providerApiKey
            ? (isEncrypted(inverter.providerApiKey) ? decrypt(inverter.providerApiKey) : inverter.providerApiKey)
            : undefined;
        const decryptedApiSecret = inverter.providerApiSecret
            ? (isEncrypted(inverter.providerApiSecret) ? decrypt(inverter.providerApiSecret) : inverter.providerApiSecret)
            : undefined;

        return new InverterModel(
            inverter.id,
            inverter.name || inverter.provider,
            inverter.provider,
            inverter.providerId,
            decryptedApiKey,
            decryptedApiSecret,
            inverter.providerUrl || undefined,
            inverter.clientId || undefined,
            {
                plantId: inverter.plantId || undefined,
                providerPlantId: inverter.providerPlantId || undefined,
                providerPlantName: inverter.providerPlantName || undefined,
                providerStatus: inverter.providerStatus || undefined,
                providerConfig: inverter.providerConfig,
                providerMetadata: inverter.providerMetadata,
                serialNumber: inverter.serialNumber || undefined,
                manufacturer: inverter.manufacturer || undefined,
                modelName: inverter.modelName || undefined,
                firmwareVersion: inverter.firmwareVersion || undefined,
                nominalPowerKw: inverter.nominalPowerKw == null ? undefined : Number(inverter.nominalPowerKw),
                timezone: inverter.timezone || undefined,
                syncEnabled: inverter.syncEnabled,
                syncIntervalMinutes: inverter.syncIntervalMinutes || undefined,
                lastSyncAt: inverter.lastSyncAt || undefined,
                lastSuccessfulSyncAt: inverter.lastSuccessfulSyncAt || undefined,
                lastSyncStatus: inverter.lastSyncStatus || undefined,
                lastSyncError: inverter.lastSyncError || undefined,
                installedAt: inverter.installedAt || undefined,
                commissionedAt: inverter.commissionedAt || undefined,
            }
        );
    }
}
