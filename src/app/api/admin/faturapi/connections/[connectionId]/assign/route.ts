import { faturapiAdminRoute, ok } from '@/backend/integrations/faturapi/faturapi-admin-route';
import { assignConnectionSchema } from '@/backend/integrations/faturapi/faturapi-admin.schemas';

/** Liga uma conexao criada direto na Faturapi a um cliente do app. */
export const POST = faturapiAdminRoute<{ connectionId: string }>(async ({ request, params, service }) => {
    const { clientId } = assignConnectionSchema.parse(await request.json());
    return ok(await service.assignConnection(params.connectionId, clientId));
});
