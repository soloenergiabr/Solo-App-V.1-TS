import { InverterRepository } from "../repositories/inverter.repository";
import { GenerationUnitRepository } from "../repositories/generation-unit.repository";
import { CalculateTotalEnergyGeneratedUseCase, CalculateTotalEnergyGeneratedRequest, CalculateTotalEnergyGeneratedResponse } from "../use-cases/calculate-total-energy-generated.use-case";
import { GetLatestGenerationDataUseCase, GetLatestGenerationDataRequest, GetLatestGenerationDataResponse } from "../use-cases/get-latest-generation-data.use-case";
import { GetGenerationUnitsByInverterIdUseCase, GetGenerationUnitsByInverterIdRequest, GetGenerationUnitsByInverterIdResponse } from "../use-cases/get-generation-units-by-inverter-id.use-case";
import { SyncInverterGenerationDataUseCase, SyncInverterGenerationDataRequest, SyncInverterGenerationDataResponse } from "../use-cases/sync-inverter-generation-data.use-case";
import { CreateGenerationUnitUseCase, CreateGenerationUnitRequest, CreateGenerationUnitResponse } from "../use-cases/create-generation-unit.use-case";
import { UserContext } from '@/backend/auth/models/user-context.model';

export class GenerationAnalyticsService {
    private calculateTotalEnergyGeneratedUseCase: CalculateTotalEnergyGeneratedUseCase;
    private getLatestGenerationDataUseCase: GetLatestGenerationDataUseCase;
    private getGenerationUnitsByInverterIdUseCase: GetGenerationUnitsByInverterIdUseCase;
    private syncInverterGenerationDataUseCase: SyncInverterGenerationDataUseCase;
    private createGenerationUnitUseCase: CreateGenerationUnitUseCase;

    constructor(
        private inverterRepository: InverterRepository,
        private generationUnitRepository: GenerationUnitRepository
    ) {
        this.calculateTotalEnergyGeneratedUseCase = new CalculateTotalEnergyGeneratedUseCase(
            inverterRepository,
            generationUnitRepository
        );
        this.getLatestGenerationDataUseCase = new GetLatestGenerationDataUseCase(
            inverterRepository,
            generationUnitRepository
        );
        this.getGenerationUnitsByInverterIdUseCase = new GetGenerationUnitsByInverterIdUseCase(
            inverterRepository,
            generationUnitRepository
        );
        this.syncInverterGenerationDataUseCase = new SyncInverterGenerationDataUseCase(
            inverterRepository,
            generationUnitRepository
        );
        this.createGenerationUnitUseCase = new CreateGenerationUnitUseCase(
            inverterRepository,
            generationUnitRepository
        );
    }

    async calculateTotalEnergyGenerated(request: CalculateTotalEnergyGeneratedRequest, userContext: UserContext): Promise<CalculateTotalEnergyGeneratedResponse> {
        return await this.calculateTotalEnergyGeneratedUseCase.execute(request, userContext);
    }

    async getLatestGenerationData(request: GetLatestGenerationDataRequest, userContext: UserContext): Promise<GetLatestGenerationDataResponse> {
        return await this.getLatestGenerationDataUseCase.execute(request, userContext);
    }

    async getGenerationUnitsByInverterId(request: GetGenerationUnitsByInverterIdRequest, userContext: UserContext): Promise<GetGenerationUnitsByInverterIdResponse> {
        return await this.getGenerationUnitsByInverterIdUseCase.execute(request, userContext);
    }

    async syncInverterGenerationData(request: SyncInverterGenerationDataRequest, userContext: UserContext): Promise<SyncInverterGenerationDataResponse> {
        return await this.syncInverterGenerationDataUseCase.execute(request, userContext);
    }

    async createGenerationUnit(request: CreateGenerationUnitRequest, userContext: UserContext): Promise<CreateGenerationUnitResponse> {
        return await this.createGenerationUnitUseCase.execute(request, userContext);
    }
}
