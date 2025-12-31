import { ConsumptionService } from "../services/consumption.service";
// Ideally we would inject GenerationService here to calculate self-consumption if needed for total savings
// For now, calculating based on available bill data

interface DashboardFilters {
    clientId: string;
    startDate?: Date;
    endDate?: Date;
}

interface SavingsData {
    period: Date;
    expectedBill: number; // Without solar
    actualBill: number;
    savings: number;
}

interface ConsumptionDashboardData {
    history: {
        competenceDate: Date;
        consumptionKwh: number; // Grid
        injectedEnergyKwh: number;
        tariffPerKwh: number;
        totalBillValue: number;
    }[];
    savings: SavingsData[];
    totalSavings: number;
}

export class GetConsumptionDashboardUseCase {
    constructor(private consumptionService: ConsumptionService) { }

    async execute(filters: DashboardFilters): Promise<ConsumptionDashboardData> {
        const consumptions = await this.consumptionService.getClientConsumption(
            filters.clientId,
            filters.startDate,
            filters.endDate
        );

        const history = consumptions.map(c => ({
            competenceDate: c.competenceDate,
            consumptionKwh: c.consumptionKwh,
            injectedEnergyKwh: c.injectedEnergyKwh,
            tariffPerKwh: c.tariffPerKwh,
            totalBillValue: c.totalBillValue,
        }));

        const savings: SavingsData[] = consumptions.map(c => {
            const estimatedConsumption = c.consumptionKwh + c.injectedEnergyKwh;
            const expectedBill = estimatedConsumption * c.tariffPerKwh;
            const savingsValue = expectedBill - c.totalBillValue;

            return {
                period: c.competenceDate,
                expectedBill: Math.max(0, expectedBill),
                actualBill: c.totalBillValue,
                savings: Math.max(0, savingsValue),
            };
        });

        const totalSavings = savings.reduce((acc, curr) => acc + curr.savings, 0);

        return {
            history,
            savings,
            totalSavings
        };
    }
}
