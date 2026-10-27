import { faturapiAdminRoute, ok } from '@/backend/integrations/faturapi/faturapi-admin-route';
import { linkUnitSchema, updateUnitSchema } from '@/backend/integrations/faturapi/faturapi-admin.schemas';

type Params = { id: string; unitId: string };

// Vincula a UC a uma unidade monitorada da Faturapi, que passa a buscar a fatura
// todo mes e avisar via webhook. A senha da distribuidora vai direto para a
// Faturapi (que a guarda criptografada) e nunca e salva aqui.
export const POST = faturapiAdminRoute<Params>(async ({ request, params, service }) => {
    const data = linkUnitSchema.parse(await request.json());
    return ok(await service.linkUnit(params.id, params.unitId, data), 201);
});

/** Pausa/retoma a busca automatica ou troca a senha (UC sem conexao). */
export const PATCH = faturapiAdminRoute<Params>(async ({ request, params, service }) => {
    const data = updateUnitSchema.parse(await request.json());
    return ok(await service.updateUnit(params.id, params.unitId, data));
});

/** Para de monitorar na Faturapi; as faturas ja salvas continuam no app. */
export const DELETE = faturapiAdminRoute<Params>(async ({ params, service }) => {
    return ok(await service.unlinkUnit(params.id, params.unitId));
});
