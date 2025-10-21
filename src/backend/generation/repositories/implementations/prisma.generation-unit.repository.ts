import { PrismaClient } from "@/app/generated/prisma";
import { GenerationUnitModel, GenerationUnitType } from "../../models/generation-unit.model";
import { GenerationUnitRepository } from "../generation-unit.repository";

export class PrismaGenerationUnitRepository implements GenerationUnitRepository {
    constructor(private prisma: PrismaClient) { }

    async create(generationUnit: GenerationUnitModel): Promise<void> {
        await this.prisma.generationUnit.create({
            data: {
                id: generationUnit.id,
                power: generationUnit.power,
                energy: generationUnit.energy,
                generationUnitType: generationUnit.generationUnitType,
                inverterId: generationUnit.inverterId,
                timestamp: generationUnit.timestamp,
            },
        });
    }

    async findByInverterId(inverterId: string): Promise<GenerationUnitModel[]> {
        const generationUnits = await this.prisma.generationUnit.findMany({
            where: {
                inverterId,
                deletedAt: null,
            },
            orderBy: {
                timestamp: 'desc',
            },
        });

        return generationUnits.map(unit => new GenerationUnitModel({
            id: unit.id,
            power: unit.power,
            energy: unit.energy,
            generationUnitType: unit.generationUnitType as GenerationUnitType,
            inverterId: unit.inverterId,
            timestamp: unit.timestamp,
        }));
    }

    async update(generationUnit: GenerationUnitModel): Promise<void> {
        const existingUnit = await this.prisma.generationUnit.findFirst({
            where: {
                id: generationUnit.id,
                deletedAt: null,
            },
        });

        if (!existingUnit) {
            throw new Error("Generation unit not found");
        }

        await this.prisma.generationUnit.update({
            where: {
                id: generationUnit.id,
            },
            data: {
                power: generationUnit.power,
                energy: generationUnit.energy,
                generationUnitType: generationUnit.generationUnitType,
                timestamp: generationUnit.timestamp,
                updatedAt: new Date(),
            },
        });
    }

    async deleteAll(): Promise<void> {
        // Soft delete all generation units
        await this.prisma.generationUnit.updateMany({
            where: {
                deletedAt: null,
            },
            data: {
                deletedAt: new Date(),
            },
        });
    }

    async findByInverterIdAndType(
        inverterId: string,
        type: GenerationUnitType
    ): Promise<GenerationUnitModel[]> {
        const generationUnits = await this.prisma.generationUnit.findMany({
            where: {
                inverterId,
                generationUnitType: type,
                deletedAt: null,
            },
            orderBy: {
                timestamp: 'desc',
            },
        });

        return generationUnits.map(unit => new GenerationUnitModel({
            id: unit.id,
            power: unit.power,
            energy: unit.energy,
            generationUnitType: unit.generationUnitType as GenerationUnitType,
            inverterId: unit.inverterId,
            timestamp: unit.timestamp,
        }));
    }

    async findByInverterIdAndDateRange(
        inverterId: string,
        startDate: Date,
        endDate: Date
    ): Promise<GenerationUnitModel[]> {
        const generationUnits = await this.prisma.generationUnit.findMany({
            where: {
                inverterId,
                timestamp: {
                    gte: startDate,
                    lte: endDate,
                },
                deletedAt: null,
            },
            orderBy: {
                timestamp: 'desc',
            },
        });

        return generationUnits.map(unit => new GenerationUnitModel({
            id: unit.id,
            power: unit.power,
            energy: unit.energy,
            generationUnitType: unit.generationUnitType as GenerationUnitType,
            inverterId: unit.inverterId,
            timestamp: unit.timestamp,
        }));
    }

    async delete(id: string): Promise<void> {
        const existingUnit = await this.prisma.generationUnit.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });

        if (!existingUnit) {
            throw new Error("Generation unit not found");
        }

        // Soft delete
        await this.prisma.generationUnit.update({
            where: {
                id,
            },
            data: {
                deletedAt: new Date(),
            },
        });
    }

    async findLatestByInverterId(inverterId: string): Promise<GenerationUnitModel | null> {
        const latestUnit = await this.prisma.generationUnit.findFirst({
            where: {
                inverterId,
                deletedAt: null,
            },
            orderBy: {
                timestamp: 'desc',
            },
        });

        if (!latestUnit) {
            return null;
        }

        return new GenerationUnitModel({
            id: latestUnit.id,
            power: latestUnit.power,
            energy: latestUnit.energy,
            generationUnitType: latestUnit.generationUnitType as GenerationUnitType,
            inverterId: latestUnit.inverterId,
        });
    }
}
