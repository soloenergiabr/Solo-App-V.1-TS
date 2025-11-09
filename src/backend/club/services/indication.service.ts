import { IndicationRepository } from "../repositories/indication.repository";
import { GetIndicationsUseCase, GetIndicationsRequest, GetIndicationsResponse } from "../use-cases/get-indications.use-case";
import { UserContext } from '@/backend/auth/models/user-context.model';

export class IndicationService {
    private getIndicationsUseCase: GetIndicationsUseCase;

    constructor(
        private indicationRepository: IndicationRepository
    ) {
        this.getIndicationsUseCase = new GetIndicationsUseCase(indicationRepository);
    }

    async getIndications(request: GetIndicationsRequest, userContext: UserContext): Promise<GetIndicationsResponse> {
        return await this.getIndicationsUseCase.execute(request, userContext);
    }
}
