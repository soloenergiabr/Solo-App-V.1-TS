import { faturapiAdminRoute, ok } from '@/backend/integrations/faturapi/faturapi-admin-route';
import { updateConnectionSchema } from '@/backend/integrations/faturapi/faturapi-admin.schemas';

type Params = { id: string; connectionId: string };

/** Troca a senha da conexao (a Faturapi sincroniza de novo). */
export const PATCH = faturapiAdminRoute<Params>(async ({ request, params, service }) => {
    const { credentials } = updateConnectionSchema.parse(await request.json());
    await service.updateConnectionCredentials(params.id, params.connectionId, credentials);
    return ok(null);
});

/** Remove a conexao; as UCs dela param de ser buscadas. */
export const DELETE = faturapiAdminRoute<Params>(async ({ params, service }) => {
    await service.deleteConnection(params.id, params.connectionId);
    return ok(null);
});
