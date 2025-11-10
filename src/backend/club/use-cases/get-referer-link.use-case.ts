import { z } from "zod";
import { ClientRepository } from "../repositories/client.repository";
import { UserContext } from '@/backend/auth/models/user-context.model';


export const GetRefererLinkResponseSchema = z.object({
    link: z.string(),
});

// Types generated from schemas
export type GetRefererLinkResponse = z.infer<typeof GetRefererLinkResponseSchema>;

export class GetRefererLinkUseCase {
    constructor(
        private clientRepository: ClientRepository
    ) { }

    async execute(userContext: UserContext): Promise<GetRefererLinkResponse> {
        // Verificar permissões - usuários podem ver suas próprias indicações
        if (!userContext.clientId) {
            throw new Error('Client ID not found in user context');
        }

        // Buscar o cliente atual
        const client = await this.clientRepository.findById(userContext.clientId);
        if (!client) {
            throw new Error('Client not found');
        }

        // Gerar link de indicação
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const refererLink = `${baseUrl}/register?indication=${client.indicationCode}`;

        return GetRefererLinkResponseSchema.parse({
            link: refererLink,
        });
    }
}
