import { faturapiAdminRoute, ok } from '@/backend/integrations/faturapi/faturapi-admin-route';

/** Conexoes e UCs do cliente com o estado vivo da Faturapi. */
export const GET = faturapiAdminRoute<{ id: string }>(async ({ params, service }) => {
    return ok(await service.getClientOverview(params.id));
});
