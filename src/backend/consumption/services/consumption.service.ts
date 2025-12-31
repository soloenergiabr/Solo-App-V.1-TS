import { Consumption } from "@/app/generated/prisma";
import { ConsumptionRepository } from "../repositories/consumption.repository";

export class ConsumptionService {
    constructor(
        private consumptionRepository: ConsumptionRepository
    ) { }

    async createConsumption(data: Omit<Consumption, 'id' | 'createdAt' | 'updatedAt'>): Promise<Consumption> {
        // Here we could add validation logic if needed
        return this.consumptionRepository.create(data);
    }

    async getClientConsumption(clientId: string, startDate?: Date, endDate?: Date): Promise<Consumption[]> {
        if (startDate && endDate) {
            return this.consumptionRepository.findByClientIdAndPeriod(clientId, startDate, endDate);
        }
        return this.consumptionRepository.findByClientId(clientId);
    }
}
