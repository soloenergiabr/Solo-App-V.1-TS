import { faturapiAdminRoute, ok } from '@/backend/integrations/faturapi/faturapi-admin-route';

/** Saldo, unidades, conexoes, extracoes e webhooks recebidos. */
export const GET = faturapiAdminRoute(async ({ service }) => ok(await service.getOverview()));
