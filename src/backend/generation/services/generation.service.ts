import { InverterRepository } from "../repositories/inverter.repository";
import { GenerationUnitRepository } from "../repositories/generation-unit.repository";
import { InverterService } from "./inverter.service";
import { GenerationAnalyticsService } from "./generation-analytics.service";

// Types for the orchestrator service
import type {
    CreateInverterRequest,
    CreateInverterResponse
} from "../use-cases/create-inverter.use-case";

import type {
    GetInvertersResponse
} from "../use-cases/get-inverters.use-case";

import type {
    GetInverterByIdRequest,
    GetInverterByIdResponse
} from "../use-cases/get-inverter-by-id.use-case";

import type {
    CreateGenerationUnitRequest,
    CreateGenerationUnitResponse
} from "../use-cases/create-generation-unit.use-case";

import type {
    GetGenerationUnitsByInverterIdRequest,
    GetGenerationUnitsByInverterIdResponse
} from "../use-cases/get-generation-units-by-inverter-id.use-case";

import type {
    CalculateTotalEnergyGeneratedRequest,
    CalculateTotalEnergyGeneratedResponse
} from "../use-cases/calculate-total-energy-generated.use-case";

import type {
    GetLatestGenerationDataRequest,
    GetLatestGenerationDataResponse
} from "../use-cases/get-latest-generation-data.use-case";

import type {
    SyncInverterGenerationDataRequest,
    SyncInverterGenerationDataResponse
} from "../use-cases/sync-inverter-generation-data.use-case";
import { UserContext } from "@/backend/auth/models/user-context.model";

/**
 * Main orchestrator service that coordinates between specialized services
 * This service acts as a facade for the generation domain
 */
export class GenerationService {
    private inverterService: InverterService;
    private generationAnalyticsService: GenerationAnalyticsService;

    constructor(
        inverterRepository: InverterRepository,
        generationUnitRepository: GenerationUnitRepository
    ) {
        this.inverterService = new InverterService(inverterRepository);
        this.generationAnalyticsService = new GenerationAnalyticsService(
            inverterRepository,
            generationUnitRepository
        );
    }

    // Inverter operations - delegate to InverterService
    async createInverter(request: CreateInverterRequest, userContext: UserContext): Promise<CreateInverterResponse> {
        return await this.inverterService.createInverter(request, userContext);
    }

    async getInverters(userContext: UserContext): Promise<GetInvertersResponse> {
        return await this.inverterService.getInverters(userContext);
    }

    async getInverterById(request: GetInverterByIdRequest, userContext: UserContext): Promise<GetInverterByIdResponse> {
        return await this.inverterService.getInverterById(request, userContext);
    }

    // Generation unit operations - delegate to GenerationAnalyticsService
    async createGenerationUnit(request: CreateGenerationUnitRequest, userContext: UserContext): Promise<CreateGenerationUnitResponse> {
        return await this.generationAnalyticsService.createGenerationUnit(request, userContext);
    }

    async getGenerationUnitsByInverterId(request: GetGenerationUnitsByInverterIdRequest, userContext: UserContext): Promise<GetGenerationUnitsByInverterIdResponse> {
        return await this.generationAnalyticsService.getGenerationUnitsByInverterId(request, userContext);
    }

    // Business logic operations - delegate to GenerationAnalyticsService
    async syncInverterData(request: SyncInverterGenerationDataRequest, userContext: UserContext): Promise<SyncInverterGenerationDataResponse> {
        return await this.generationAnalyticsService.syncInverterGenerationData(request, userContext);
    }

    async calculateTotalEnergyGenerated(request: CalculateTotalEnergyGeneratedRequest, userContext: UserContext): Promise<CalculateTotalEnergyGeneratedResponse> {
        return await this.generationAnalyticsService.calculateTotalEnergyGenerated(request, userContext);
    }

    async getLatestGenerationData(request: GetLatestGenerationDataRequest, userContext: UserContext): Promise<GetLatestGenerationDataResponse> {
        return await this.generationAnalyticsService.getLatestGenerationData(request, userContext);
    }

    // Convenience methods for complex operations
    async getCompleteInverterAnalytics(inverterId: string, userContext: UserContext, startDate?: string, endDate?: string) {
        const [inverter, generationUnits, totalEnergy, latestData] = await Promise.all([
            this.getInverterById({ inverterId }, userContext),
            this.getGenerationUnitsByInverterId({
                inverterId,
                startDate,
                endDate
            }, userContext),
            this.calculateTotalEnergyGenerated({
                inverterId,
                startDate,
                endDate
            }, userContext),
            this.getLatestGenerationData({ inverterId }, userContext)
        ]);

        return {
            inverter: inverter.inverter,
            generationUnits: generationUnits.generationUnits,
            totalEnergy: totalEnergy.totalEnergy,
            latestData: latestData.latestData,
            summary: {
                totalUnits: generationUnits.count,
                period: {
                    startDate: startDate || 'all time',
                    endDate: endDate || 'all time'
                }
            }
        };
    }

    async syncAllInvertersData(userContext: UserContext): Promise<{ results: SyncInverterGenerationDataResponse[], errors: any[] }> {
        const inverters = await this.getInverters(userContext);
        const results: SyncInverterGenerationDataResponse[] = [];
        const errors: any[] = [];

        for (const inverter of inverters.inverters) {
            try {
                const result = await this.syncInverterData({ inverterId: inverter.id }, userContext);
                results.push(result);
            } catch (error) {
                errors.push({
                    inverterId: inverter.id,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        return { results, errors };
    }
}
