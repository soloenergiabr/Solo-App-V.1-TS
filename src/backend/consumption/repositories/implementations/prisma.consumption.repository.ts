import { PrismaClient, Consumption } from "@/app/generated/prisma";
import { ConsumptionRepository } from "../consumption.repository";

export class PrismaConsumptionRepository implements ConsumptionRepository {
    constructor(private prisma: PrismaClient) { }

    async create(data: Omit<Consumption, 'id' | 'createdAt' | 'updatedAt'>): Promise<Consumption> {
        return this.prisma.consumption.create({
            data,
        });
    }

    async findByClientIdAndPeriod(clientId: string, startDate: Date, endDate: Date): Promise<Consumption[]> {
        return this.prisma.consumption.findMany({
            where: {
                clientId,
                competenceDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: {
                competenceDate: 'asc',
            },
        });
    }

    async findByClientId(clientId: string): Promise<Consumption[]> {
        return this.prisma.consumption.findMany({
            where: {
                clientId,
            },
            orderBy: {
                competenceDate: 'desc',
            },
        });
    }
}
