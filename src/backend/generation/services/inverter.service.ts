import { InverterRepository } from "../repositories/inverter.repository";
import { CreateInverterUseCase, CreateInverterRequest, CreateInverterResponse } from "../use-cases/create-inverter.use-case";
import { GetInvertersUseCase, GetInvertersRequest, GetInvertersResponse } from "../use-cases/get-inverters.use-case";
import { GetInverterByIdUseCase, GetInverterByIdRequest, GetInverterByIdResponse } from "../use-cases/get-inverter-by-id.use-case";
import { UserContext } from '@/backend/auth/models/user-context.model';
import { ListProviderPlantsUseCase, ListProviderPlantsRequest, ListProviderPlantsResponse } from "../use-cases/list-provider-plants.use-case";

export class InverterService {
    private createInverterUseCase: CreateInverterUseCase;
    private getInvertersUseCase: GetInvertersUseCase;
    private getInverterByIdUseCase: GetInverterByIdUseCase;
    private listProviderPlantsUseCase: ListProviderPlantsUseCase;

    constructor(
        private inverterRepository: InverterRepository
    ) {
        this.createInverterUseCase = new CreateInverterUseCase(inverterRepository);
        this.getInvertersUseCase = new GetInvertersUseCase(inverterRepository);
        this.getInverterByIdUseCase = new GetInverterByIdUseCase(inverterRepository);
        this.listProviderPlantsUseCase = new ListProviderPlantsUseCase();
    }

    async createInverter(
        request: CreateInverterRequest,
        userContext: UserContext
    ): Promise<CreateInverterResponse> {
        return await this.createInverterUseCase.execute(request, userContext);
    }

    async getInverters(userContext: UserContext, request?: GetInvertersRequest): Promise<GetInvertersResponse> {
        return await this.getInvertersUseCase.execute(userContext, request);
    }

    async getInverterById(
        request: GetInverterByIdRequest,
        userContext: UserContext
    ): Promise<GetInverterByIdResponse> {
        return await this.getInverterByIdUseCase.execute(request, userContext);
    }

    async listProviderPlants(
        request: ListProviderPlantsRequest,
    ): Promise<ListProviderPlantsResponse> {
        return this.listProviderPlantsUseCase.execute(request);
    }
}
