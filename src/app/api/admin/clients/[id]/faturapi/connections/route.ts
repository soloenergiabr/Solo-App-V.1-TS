import { faturapiAdminRoute, ok } from '@/backend/integrations/faturapi/faturapi-admin-route';
import { createConnectionSchema } from '@/backend/integrations/faturapi/faturapi-admin.schemas';

/** Cria uma conexao (login da distribuidora); a Faturapi lista as UCs da conta. */
export const POST = faturapiAdminRoute<{ id: string }>(async ({ request, params, service }) => {
    const data = createConnectionSchema.parse(await request.json());
    return ok(await service.createConnection(params.id, data), 201);
});
