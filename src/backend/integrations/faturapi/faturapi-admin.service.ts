import { Prisma, PrismaClient } from '@/app/generated/prisma';
import { FaturapiClient, FaturapiError } from './faturapi.client';
import type {
    FaturapiConnection,
    FaturapiCredentials,
    FaturapiExtraction,
    FaturapiUnit,
} from './faturapi.types';

// Regras de negocio do painel de admin da Faturapi. As rotas so validam a
// entrada e chamam este servico; o estado vivo (status, proxima busca, UCs
// descobertas) vem sempre da API, o banco guarda os vinculos com o app.

type Client = Pick<FaturapiClient,
    | 'createUnit' | 'getUnit' | 'listUnits' | 'updateUnit' | 'deleteUnit' | 'checkUnit' | 'backfillUnit'
    | 'listUnitExtractions' | 'listExtractions' | 'createConnection' | 'listConnections' | 'getConnection'
    | 'updateConnectionCredentials' | 'syncConnection' | 'addConnectionUnits' | 'deleteConnection'
    | 'getBalance' | 'getUsage'>;

export class FaturapiAdminError extends Error {
    constructor(public readonly status: number, message: string) {
        super(message);
        this.name = 'FaturapiAdminError';
    }
}

/** Chama a API sem derrubar a tela inteira quando um item falha (ex.: unidade apagada na Faturapi). */
async function settle<T>(promise: Promise<T>): Promise<{ data: T | null; error: string | null }> {
    try {
        return { data: await promise, error: null };
    } catch (error) {
        return { data: null, error: error instanceof Error ? error.message : String(error) };
    }
}

function connectionToRecord(connection: FaturapiConnection) {
    return {
        source: connection.source,
        status: connection.status,
        credentialsHint: connection.credentialsHint,
        lastSyncAt: connection.lastSyncAt ? new Date(connection.lastSyncAt) : null,
        lastError: connection.lastError
            ? (connection.lastError as unknown as Prisma.InputJsonValue)
            : Prisma.JsonNull,
    };
}

export class FaturapiAdminService {
    constructor(
        private prisma: PrismaClient,
        private faturapi: Client,
    ) { }

    // ------------------------------------------------------------------
    // Visao geral (pagina /admin/faturapi)
    // ------------------------------------------------------------------

    async getOverview() {
        const [balance, usage, units, connections, extractions, events, linkedUnits, linkedConnections] = await Promise.all([
            settle(this.faturapi.getBalance()),
            settle(this.faturapi.getUsage()),
            settle(this.listAllUnits()),
            settle(this.faturapi.listConnections()),
            settle(this.faturapi.listExtractions({ limit: 20 })),
            this.prisma.faturapiWebhookEvent.findMany({
                orderBy: { createdAt: 'desc' },
                take: 30,
                select: { eventId: true, type: true, status: true, error: true, createdAt: true, processedAt: true },
            }),
            this.prisma.consumerUnit.findMany({
                where: { deletedAt: null, OR: [{ faturapiUnitId: { not: null } }, { clientNumber: { not: null } }] },
                select: {
                    id: true, name: true, clientNumber: true, faturapiUnitId: true,
                    client: { select: { id: true, name: true } },
                },
            }),
            this.prisma.faturapiConnection.findMany({
                select: { faturapiConnectionId: true, client: { select: { id: true, name: true } } },
            }),
        ]);

        const byUnitId = new Map(linkedUnits.filter((u) => u.faturapiUnitId).map((u) => [u.faturapiUnitId!, u]));
        const byClientNumber = new Map<string, typeof linkedUnits>();
        for (const unit of linkedUnits) {
            if (!unit.clientNumber) continue;
            byClientNumber.set(unit.clientNumber, [...(byClientNumber.get(unit.clientNumber) ?? []), unit]);
        }
        const connectionClients = new Map(linkedConnections.map((c) => [c.faturapiConnectionId, c.client]));

        return {
            balance: balance.data,
            usage: usage.data?.totals ?? null,
            errors: [balance, usage, units, connections, extractions].map((r) => r.error).filter(Boolean),
            units: (units.data ?? []).map((unit) => {
                const linked = byUnitId.get(unit.id);
                return {
                    unit,
                    consumerUnit: linked ? { id: linked.id, name: linked.name, client: linked.client } : null,
                    // Sugestoes para vincular unidade sem UC no app (mesmo numero de UC).
                    candidates: linked ? [] : (byClientNumber.get(unit.uc) ?? [])
                        .filter((c) => !c.faturapiUnitId)
                        .map((c) => ({ id: c.id, name: c.name, client: c.client })),
                };
            }),
            connections: (connections.data ?? []).map((connection) => ({
                connection,
                client: connectionClients.get(connection.id) ?? null,
            })),
            extractions: extractions.data?.data ?? [],
            events,
        };
    }

    private async listAllUnits(): Promise<FaturapiUnit[]> {
        const units: FaturapiUnit[] = [];
        let cursor: string | undefined;
        do {
            const page = await this.faturapi.listUnits({ limit: 100, cursor });
            units.push(...page.data);
            cursor = page.nextCursor ?? undefined;
        } while (cursor);
        return units;
    }

    /** Marca o evento para reprocessar; quem chama dispara processFaturapiEvent depois da resposta. */
    async resetEventForReprocess(eventId: string): Promise<void> {
        const { count } = await this.prisma.faturapiWebhookEvent.updateMany({
            where: { eventId, status: { not: 'processed' } },
            data: { status: 'received', error: null },
        });
        if (count === 0) throw new FaturapiAdminError(404, 'Evento nao encontrado ou ja processado');
    }

    /** Liga uma conexao criada direto na Faturapi a um cliente do app. */
    async assignConnection(faturapiConnectionId: string, clientId: string) {
        await this.requireClient(clientId);
        const connection = await this.faturapi.getConnection(faturapiConnectionId);
        const record = await this.prisma.faturapiConnection.upsert({
            where: { faturapiConnectionId },
            update: { clientId, ...connectionToRecord(connection) },
            create: { faturapiConnectionId, clientId, ...connectionToRecord(connection) },
        });
        // UCs do cliente ja monitoradas por esta conexao passam a apontar para ela.
        const unitIds = connection.discoveredUnits.map((u) => u.unitId).filter((id): id is string => !!id);
        if (unitIds.length > 0) {
            await this.prisma.consumerUnit.updateMany({
                where: { clientId, faturapiUnitId: { in: unitIds } },
                data: { faturapiConnectionId },
            });
        }
        return record;
    }

    /** Liga uma unidade monitorada sem UC no app a uma UC existente. */
    async assignUnit(faturapiUnitId: string, consumerUnitId: string) {
        const consumerUnit = await this.prisma.consumerUnit.findFirst({ where: { id: consumerUnitId, deletedAt: null } });
        if (!consumerUnit) throw new FaturapiAdminError(404, 'Unidade consumidora nao encontrada');
        if (consumerUnit.faturapiUnitId && consumerUnit.faturapiUnitId !== faturapiUnitId) {
            throw new FaturapiAdminError(409, 'A UC ja esta vinculada a outra unidade da Faturapi');
        }
        const taken = await this.prisma.consumerUnit.findFirst({ where: { faturapiUnitId, id: { not: consumerUnitId } } });
        if (taken) throw new FaturapiAdminError(409, 'Esta unidade da Faturapi ja esta vinculada a outra UC');

        const unit = await this.faturapi.getUnit(faturapiUnitId);
        return this.prisma.consumerUnit.update({
            where: { id: consumerUnitId },
            data: { faturapiUnitId: unit.id, faturapiStatus: unit.status, faturapiConnectionId: unit.connectionId },
        });
    }

    // ------------------------------------------------------------------
    // Cliente (aba Faturapi no detalhe do cliente)
    // ------------------------------------------------------------------

    async getClientOverview(clientId: string) {
        await this.requireClient(clientId);
        const [records, consumerUnits, plants] = await Promise.all([
            this.prisma.faturapiConnection.findMany({ where: { clientId }, orderBy: { createdAt: 'asc' } }),
            this.prisma.consumerUnit.findMany({
                where: { clientId, deletedAt: null },
                orderBy: { createdAt: 'asc' },
                select: {
                    id: true, name: true, clientNumber: true, plantId: true,
                    faturapiUnitId: true, faturapiStatus: true, faturapiConnectionId: true,
                },
            }),
            this.prisma.plant.findMany({ where: { clientId, deletedAt: null }, select: { id: true, name: true } }),
        ]);

        const connections = await Promise.all(records.map(async (record) => {
            const live = await settle(this.faturapi.getConnection(record.faturapiConnectionId));
            return { id: record.faturapiConnectionId, record, connection: live.data, error: live.error };
        }));

        const units = await Promise.all(consumerUnits.map(async (consumerUnit) => {
            if (!consumerUnit.faturapiUnitId) return { consumerUnit, unit: null, extractions: [], error: null };
            const [unit, extractions] = await Promise.all([
                settle(this.faturapi.getUnit(consumerUnit.faturapiUnitId)),
                settle(this.faturapi.listUnitExtractions(consumerUnit.faturapiUnitId, { limit: 5 })),
            ]);
            if (unit.data && unit.data.status !== consumerUnit.faturapiStatus) {
                // Mantem o espelho local em dia (webhooks podem ter sido perdidos).
                await this.prisma.consumerUnit.update({
                    where: { id: consumerUnit.id },
                    data: { faturapiStatus: unit.data.status },
                });
            }
            return {
                consumerUnit,
                unit: unit.data,
                extractions: extractions.data?.data ?? [],
                error: unit.error,
            };
        }));

        return { connections, units, plants };
    }

    async createConnection(clientId: string, input: { source: 'pessoa' | 'empresa'; credentials: FaturapiCredentials }) {
        await this.requireClient(clientId);
        const connection = await this.faturapi.createConnection(input);
        return this.prisma.faturapiConnection.create({
            data: { faturapiConnectionId: connection.id, clientId, ...connectionToRecord(connection) },
        });
    }

    async syncConnection(clientId: string, faturapiConnectionId: string) {
        await this.requireConnection(clientId, faturapiConnectionId);
        const connection = await this.faturapi.syncConnection(faturapiConnectionId);
        await this.prisma.faturapiConnection.update({
            where: { faturapiConnectionId },
            data: connectionToRecord(connection),
        });
        return connection;
    }

    async updateConnectionCredentials(clientId: string, faturapiConnectionId: string, credentials: FaturapiCredentials) {
        await this.requireConnection(clientId, faturapiConnectionId);
        await this.faturapi.updateConnectionCredentials(faturapiConnectionId, credentials);
        await this.prisma.faturapiConnection.update({
            where: { faturapiConnectionId },
            data: { status: 'syncing', lastError: Prisma.JsonNull },
        });
    }

    async deleteConnection(clientId: string, faturapiConnectionId: string) {
        await this.requireConnection(clientId, faturapiConnectionId);
        await this.faturapi.deleteConnection(faturapiConnectionId);
        await this.prisma.$transaction([
            // Na Faturapi as unidades da conexao ficam needs_credentials (nao sao apagadas).
            this.prisma.consumerUnit.updateMany({
                where: { faturapiConnectionId },
                data: { faturapiStatus: 'needs_credentials', faturapiConnectionId: null },
            }),
            this.prisma.faturapiConnection.delete({ where: { faturapiConnectionId } }),
        ]);
    }

    /**
     * Passa a monitorar UCs descobertas pela conexao. UCs que ainda nao existem
     * no app sao criadas na usina escolhida; as que existem (mesmo numero de
     * cliente) so sao vinculadas.
     */
    async monitorConnectionUnits(
        clientId: string,
        faturapiConnectionId: string,
        input: { ucs: string[]; plantId?: string; backfill?: number },
    ) {
        await this.requireConnection(clientId, faturapiConnectionId);
        const connection = await this.faturapi.getConnection(faturapiConnectionId);
        const discovered = new Map(connection.discoveredUnits.map((u) => [u.uc, u]));

        const unknown = input.ucs.filter((uc) => !discovered.has(uc));
        if (unknown.length > 0) {
            throw new FaturapiAdminError(400, `UC nao encontrada na conexao: ${unknown.join(', ')}`);
        }

        const existing = await this.prisma.consumerUnit.findMany({
            where: { clientId, deletedAt: null, clientNumber: { in: input.ucs } },
        });
        const existingByUc = new Map(existing.map((u) => [u.clientNumber!, u]));
        const toCreate = input.ucs.filter((uc) => !existingByUc.has(uc));

        if (toCreate.length > 0) {
            if (!input.plantId) {
                throw new FaturapiAdminError(400, 'Escolha a usina onde criar as UCs que ainda nao existem no app');
            }
            const plant = await this.prisma.plant.findFirst({ where: { id: input.plantId, clientId, deletedAt: null } });
            if (!plant) throw new FaturapiAdminError(404, 'Usina nao encontrada');
        }

        // Primeiro a API: se falhar (ex.: sem credito), nada e criado no app.
        const pending = input.ucs.filter((uc) => !discovered.get(uc)!.monitored);
        const created = pending.length > 0
            ? await this.faturapi.addConnectionUnits(faturapiConnectionId, { ucs: pending, backfill: input.backfill ?? 0 })
            : [];
        const unitByUc = new Map<string, { id: string; status: string }>(created.map((u) => [u.uc, u]));
        for (const uc of input.ucs) {
            const found = discovered.get(uc)!;
            if (found.monitored && found.unitId) unitByUc.set(uc, { id: found.unitId, status: 'active' });
        }

        return this.prisma.$transaction(input.ucs.map((uc) => {
            const unit = unitByUc.get(uc);
            const link = {
                faturapiUnitId: unit?.id ?? null,
                faturapiStatus: unit?.status ?? null,
                faturapiConnectionId,
            };
            const current = existingByUc.get(uc);
            if (current) {
                return this.prisma.consumerUnit.update({ where: { id: current.id }, data: link });
            }
            const info = discovered.get(uc)!;
            return this.prisma.consumerUnit.create({
                data: {
                    clientId,
                    plantId: input.plantId!,
                    name: info.address ?? `UC ${uc}`,
                    accountHolder: info.name,
                    clientNumber: uc,
                    installationNumber: uc,
                    address: info.address,
                    distributor: connection.provider === 'enel-ce' ? 'Enel CE' : connection.provider,
                    ...link,
                },
            });
        }));
    }

    // ------------------------------------------------------------------
    // Unidade monitorada (UC do app)
    // ------------------------------------------------------------------

    async linkUnit(
        clientId: string,
        consumerUnitId: string,
        input: { source: 'pessoa' | 'empresa' | 'inbox'; credentials?: FaturapiCredentials; backfill?: number },
    ) {
        const consumerUnit = await this.requireConsumerUnit(clientId, consumerUnitId);
        if (consumerUnit.faturapiUnitId) throw new FaturapiAdminError(409, 'Unidade consumidora ja vinculada a Faturapi');
        if (!consumerUnit.clientNumber) {
            throw new FaturapiAdminError(400, 'Informe o numero do cliente (UC) antes de vincular a Faturapi.');
        }
        const { unit } = await this.faturapi.createUnit({
            uc: consumerUnit.clientNumber,
            source: input.source,
            credentials: input.credentials,
            label: consumerUnit.name ?? undefined,
            backfill: input.backfill,
        });
        return this.prisma.consumerUnit.update({
            where: { id: consumerUnitId },
            data: { faturapiUnitId: unit.id, faturapiStatus: unit.status, faturapiConnectionId: unit.connectionId },
        });
    }

    async updateUnit(
        clientId: string,
        consumerUnitId: string,
        input: { status?: 'active' | 'paused'; credentials?: FaturapiCredentials },
    ) {
        const consumerUnit = await this.requireLinkedUnit(clientId, consumerUnitId);
        if (input.credentials && consumerUnit.faturapiConnectionId) {
            throw new FaturapiAdminError(400, 'Esta UC usa o login de uma conexao: atualize a senha na conexao.');
        }
        const unit = await this.faturapi.updateUnit(consumerUnit.faturapiUnitId!, input);
        await this.prisma.consumerUnit.update({ where: { id: consumerUnitId }, data: { faturapiStatus: unit.status } });
        return unit;
    }

    async checkUnit(clientId: string, consumerUnitId: string): Promise<FaturapiExtraction> {
        const consumerUnit = await this.requireLinkedUnit(clientId, consumerUnitId);
        return this.faturapi.checkUnit(consumerUnit.faturapiUnitId!);
    }

    async backfillUnit(clientId: string, consumerUnitId: string, months: number): Promise<FaturapiExtraction> {
        const consumerUnit = await this.requireLinkedUnit(clientId, consumerUnitId);
        return this.faturapi.backfillUnit(consumerUnit.faturapiUnitId!, months);
    }

    /** Para de monitorar na Faturapi e desfaz o vinculo (faturas ja salvas ficam). */
    async unlinkUnit(clientId: string, consumerUnitId: string) {
        const consumerUnit = await this.requireLinkedUnit(clientId, consumerUnitId);
        try {
            await this.faturapi.deleteUnit(consumerUnit.faturapiUnitId!);
        } catch (error) {
            // Ja apagada na Faturapi: so limpa o vinculo local.
            if (!(error instanceof FaturapiError && error.status === 404)) throw error;
        }
        return this.prisma.consumerUnit.update({
            where: { id: consumerUnitId },
            data: { faturapiUnitId: null, faturapiStatus: null, faturapiConnectionId: null },
        });
    }

    // ------------------------------------------------------------------

    private async requireClient(clientId: string) {
        const client = await this.prisma.client.findFirst({ where: { id: clientId, deletedAt: null }, select: { id: true } });
        if (!client) throw new FaturapiAdminError(404, 'Cliente nao encontrado');
        return client;
    }

    private async requireConnection(clientId: string, faturapiConnectionId: string) {
        const record = await this.prisma.faturapiConnection.findFirst({ where: { clientId, faturapiConnectionId } });
        if (!record) throw new FaturapiAdminError(404, 'Conexao nao encontrada para este cliente');
        return record;
    }

    private async requireConsumerUnit(clientId: string, consumerUnitId: string) {
        const consumerUnit = await this.prisma.consumerUnit.findFirst({ where: { id: consumerUnitId, clientId, deletedAt: null } });
        if (!consumerUnit) throw new FaturapiAdminError(404, 'Unidade consumidora nao encontrada');
        return consumerUnit;
    }

    private async requireLinkedUnit(clientId: string, consumerUnitId: string) {
        const consumerUnit = await this.requireConsumerUnit(clientId, consumerUnitId);
        if (!consumerUnit.faturapiUnitId) throw new FaturapiAdminError(400, 'Unidade consumidora nao vinculada a Faturapi');
        return consumerUnit;
    }
}
