import { z } from "zod";
import { IndicationRepository } from "../repositories/indication.repository";
import { UserContext } from '@/backend/auth/models/user-context.model';

// Request Schema
export const GetIndicationsRequestSchema = z.object({
    type: z.enum(['as_referrer', 'as_referred']).default('as_referrer'),
});

// Response Schema
export const GetIndicationsResponseSchema = z.object({
    indications: z.array(z.object({
        id: z.string(),
        referrer: z.object({
            id: z.string(),
            name: z.string(),
            email: z.string(),
        }).optional(),
        referred: z.object({
            id: z.string(),
            name: z.string(),
            email: z.string(),
        }).optional(),
        status: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
    })),
});

// Types generated from schemas
export type GetIndicationsRequest = z.infer<typeof GetIndicationsRequestSchema>;
export type GetIndicationsResponse = z.infer<typeof GetIndicationsResponseSchema>;

export class GetIndicationsUseCase {
    constructor(
        private indicationRepository: IndicationRepository
    ) { }

    async execute(request: GetIndicationsRequest, userContext: UserContext): Promise<GetIndicationsResponse> {
        // Verificar permissões - usuários podem ver suas próprias indicações
        if (!userContext.clientId) {
            throw new Error('Client ID not found in user context');
        }

        const asReferrer = request.type === 'as_referrer';
        const indications = await this.indicationRepository.findByClientId(userContext.clientId, asReferrer);

        return GetIndicationsResponseSchema.parse({
            indications: indications.map(indication => ({
                id: indication.id,
                referrer: indication.referrer ? {
                    id: indication.referrer.id,
                    name: indication.referrer.name,
                    email: indication.referrer.email,
                } : undefined,
                referred: indication.referred ? {
                    id: indication.referred.id,
                    name: indication.referred.name,
                    email: indication.referred.email,
                } : undefined,
                status: indication.status,
                createdAt: indication.createdAt.toISOString(),
                updatedAt: indication.updatedAt.toISOString(),
            })),
        });
    }
}
