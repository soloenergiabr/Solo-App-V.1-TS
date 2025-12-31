import { Consumption } from "@/app/generated/prisma";

export interface ConsumptionRepository {
    create(data: Omit<Consumption, 'id' | 'createdAt' | 'updatedAt'>): Promise<Consumption>;
    findByClientIdAndPeriod(clientId: string, startDate: Date, endDate: Date): Promise<Consumption[]>;
    findByClientId(clientId: string): Promise<Consumption[]>;
}
