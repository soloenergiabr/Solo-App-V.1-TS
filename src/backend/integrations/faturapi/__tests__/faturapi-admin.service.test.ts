import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FaturapiAdminService, FaturapiAdminError } from '../faturapi-admin.service'
import { FaturapiError } from '../faturapi.client'

type ServiceArgs = ConstructorParameters<typeof FaturapiAdminService>

const connection = {
    id: 'con_1',
    object: 'connection',
    provider: 'enel-ce',
    source: 'pessoa',
    status: 'active',
    credentialsHint: 'pr***@x.com',
    lastSyncAt: '2026-10-26T01:56:05.207Z',
    lastError: null,
    createdAt: '2026-10-26T01:54:39.373Z',
    discoveredUnits: [
        { uc: '111', name: 'SAMIA', address: 'Rua A 1', monitored: true, unitId: 'unt_111' },
        { uc: '222', name: 'SAMIA', address: 'Rua B 2', monitored: false, unitId: null },
        { uc: '333', name: 'SAMIA', address: 'Rua C 3', monitored: false, unitId: null },
    ],
}

function makePrisma() {
    const prisma = {
        client: { findFirst: vi.fn().mockResolvedValue({ id: 'client-1' }) },
        plant: { findFirst: vi.fn().mockResolvedValue({ id: 'plant-1' }), findMany: vi.fn().mockResolvedValue([]) },
        consumerUnit: {
            findFirst: vi.fn(),
            findMany: vi.fn().mockResolvedValue([]),
            create: vi.fn((args) => ({ op: 'create', ...args })),
            update: vi.fn((args) => ({ op: 'update', ...args })),
            updateMany: vi.fn((args) => ({ op: 'updateMany', ...args })),
        },
        faturapiConnection: {
            findFirst: vi.fn().mockResolvedValue({ faturapiConnectionId: 'con_1', clientId: 'client-1' }),
            findMany: vi.fn().mockResolvedValue([]),
            create: vi.fn(),
            update: vi.fn(),
            upsert: vi.fn(),
            delete: vi.fn((args) => ({ op: 'delete', ...args })),
        },
        faturapiWebhookEvent: { findMany: vi.fn().mockResolvedValue([]), updateMany: vi.fn() },
        $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
    }
    return prisma
}

function makeFaturapi() {
    return {
        createUnit: vi.fn(),
        getUnit: vi.fn(),
        listUnits: vi.fn().mockResolvedValue({ data: [], nextCursor: null }),
        updateUnit: vi.fn(),
        deleteUnit: vi.fn(),
        checkUnit: vi.fn(),
        backfillUnit: vi.fn(),
        listUnitExtractions: vi.fn().mockResolvedValue({ data: [], nextCursor: null }),
        listExtractions: vi.fn().mockResolvedValue({ data: [], nextCursor: null }),
        createConnection: vi.fn(),
        listConnections: vi.fn().mockResolvedValue([]),
        getConnection: vi.fn().mockResolvedValue(connection),
        updateConnectionCredentials: vi.fn(),
        syncConnection: vi.fn(),
        addConnectionUnits: vi.fn().mockResolvedValue([]),
        deleteConnection: vi.fn(),
        getBalance: vi.fn().mockResolvedValue({ balanceCents: 261, currency: 'brl' }),
        getUsage: vi.fn().mockResolvedValue({ days: [], totals: { completed: 1, failed: 0, costCents: 39 } }),
    }
}

describe('FaturapiAdminService', () => {
    let prisma: ReturnType<typeof makePrisma>
    let faturapi: ReturnType<typeof makeFaturapi>
    let service: FaturapiAdminService

    beforeEach(() => {
        prisma = makePrisma()
        faturapi = makeFaturapi()
        service = new FaturapiAdminService(prisma as unknown as ServiceArgs[0], faturapi as unknown as ServiceArgs[1])
    })

    describe('monitorConnectionUnits', () => {
        it('monitora so as UCs novas na API, cria no app as que faltam e vincula as existentes', async () => {
            prisma.consumerUnit.findMany.mockResolvedValue([{ id: 'cu-111', clientNumber: '111' }])
            faturapi.addConnectionUnits.mockResolvedValue([{ id: 'unt_222', uc: '222', status: 'active' }])

            await service.monitorConnectionUnits('client-1', 'con_1', { ucs: ['111', '222'], plantId: 'plant-1', backfill: 3 })

            expect(faturapi.addConnectionUnits).toHaveBeenCalledWith('con_1', { ucs: ['222'], backfill: 3 })
            expect(prisma.consumerUnit.update).toHaveBeenCalledWith({
                where: { id: 'cu-111' },
                data: { faturapiUnitId: 'unt_111', faturapiStatus: 'active', faturapiConnectionId: 'con_1' },
            })
            expect(prisma.consumerUnit.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    clientId: 'client-1',
                    plantId: 'plant-1',
                    clientNumber: '222',
                    installationNumber: '222',
                    name: 'Rua B 2',
                    accountHolder: 'SAMIA',
                    distributor: 'Enel CE',
                    faturapiUnitId: 'unt_222',
                    faturapiConnectionId: 'con_1',
                }),
            })
        })

        it('exige usina quando ha UC que nao existe no app, sem chamar a API', async () => {
            await expect(service.monitorConnectionUnits('client-1', 'con_1', { ucs: ['222'] }))
                .rejects.toMatchObject({ status: 400 })
            expect(faturapi.addConnectionUnits).not.toHaveBeenCalled()
        })

        it('rejeita UC que a conexao nao descobriu', async () => {
            await expect(service.monitorConnectionUnits('client-1', 'con_1', { ucs: ['999'], plantId: 'plant-1' }))
                .rejects.toThrow(/999/)
        })

        it('nao cria nada no app se a API falhar (ex.: sem credito)', async () => {
            faturapi.addConnectionUnits.mockRejectedValue(new FaturapiError(402, 'insufficient_credits', 'Sem saldo'))

            await expect(service.monitorConnectionUnits('client-1', 'con_1', { ucs: ['222'], plantId: 'plant-1' }))
                .rejects.toBeInstanceOf(FaturapiError)
            expect(prisma.$transaction).not.toHaveBeenCalled()
        })

        it('so opera em conexoes do proprio cliente', async () => {
            prisma.faturapiConnection.findFirst.mockResolvedValue(null)
            await expect(service.monitorConnectionUnits('client-2', 'con_1', { ucs: ['111'] }))
                .rejects.toMatchObject({ status: 404 })
            expect(faturapi.getConnection).not.toHaveBeenCalled()
        })
    })

    it('assignConnection liga a conexao ao cliente e aponta as UCs ja monitoradas para ela', async () => {
        await service.assignConnection('con_1', 'client-1')

        expect(prisma.faturapiConnection.upsert).toHaveBeenCalledWith(expect.objectContaining({
            where: { faturapiConnectionId: 'con_1' },
            create: expect.objectContaining({ clientId: 'client-1', status: 'active', source: 'pessoa' }),
        }))
        expect(prisma.consumerUnit.updateMany).toHaveBeenCalledWith({
            where: { clientId: 'client-1', faturapiUnitId: { in: ['unt_111'] } },
            data: { faturapiConnectionId: 'con_1' },
        })
    })

    describe('assignUnit', () => {
        it('vincula unidade orfa a UC existente com o status vivo', async () => {
            prisma.consumerUnit.findFirst
                .mockResolvedValueOnce({ id: 'cu-1', faturapiUnitId: null })
                .mockResolvedValueOnce(null)
            faturapi.getUnit.mockResolvedValue({ id: 'unt_111', status: 'overdue', connectionId: 'con_1' })

            await service.assignUnit('unt_111', 'cu-1')

            expect(prisma.consumerUnit.update).toHaveBeenCalledWith({
                where: { id: 'cu-1' },
                data: { faturapiUnitId: 'unt_111', faturapiStatus: 'overdue', faturapiConnectionId: 'con_1' },
            })
        })

        it('recusa unidade ja vinculada a outra UC', async () => {
            prisma.consumerUnit.findFirst
                .mockResolvedValueOnce({ id: 'cu-1', faturapiUnitId: null })
                .mockResolvedValueOnce({ id: 'cu-2' })

            await expect(service.assignUnit('unt_111', 'cu-1')).rejects.toMatchObject({ status: 409 })
        })
    })

    describe('unidade', () => {
        beforeEach(() => {
            prisma.consumerUnit.findFirst.mockResolvedValue({
                id: 'cu-1', clientId: 'client-1', clientNumber: '111', faturapiUnitId: 'unt_111', faturapiConnectionId: 'con_1',
            })
        })

        it('nao troca senha de UC que usa o login da conexao', async () => {
            await expect(service.updateUnit('client-1', 'cu-1', { credentials: { email: 'a', password: 'b' } }))
                .rejects.toThrow(/conexao/)
            expect(faturapi.updateUnit).not.toHaveBeenCalled()
        })

        it('pausa e espelha o status local', async () => {
            faturapi.updateUnit.mockResolvedValue({ id: 'unt_111', status: 'paused' })
            await service.updateUnit('client-1', 'cu-1', { status: 'paused' })
            expect(faturapi.updateUnit).toHaveBeenCalledWith('unt_111', { status: 'paused' })
            expect(prisma.consumerUnit.update).toHaveBeenCalledWith({ where: { id: 'cu-1' }, data: { faturapiStatus: 'paused' } })
        })

        it('desvincula mesmo se a unidade ja nao existe na Faturapi', async () => {
            faturapi.deleteUnit.mockRejectedValue(new FaturapiError(404, 'not_found', 'Unit not found'))
            await service.unlinkUnit('client-1', 'cu-1')
            expect(prisma.consumerUnit.update).toHaveBeenCalledWith({
                where: { id: 'cu-1' },
                data: { faturapiUnitId: null, faturapiStatus: null, faturapiConnectionId: null },
            })
        })

        it('nao desvincula localmente se a Faturapi falhar por outro motivo', async () => {
            faturapi.deleteUnit.mockRejectedValue(new FaturapiError(503, 'unavailable', 'fora'))
            await expect(service.unlinkUnit('client-1', 'cu-1')).rejects.toBeInstanceOf(FaturapiError)
            expect(prisma.consumerUnit.update).not.toHaveBeenCalled()
        })

        it('vincular exige numero de cliente na UC', async () => {
            prisma.consumerUnit.findFirst.mockResolvedValue({ id: 'cu-1', clientNumber: null, faturapiUnitId: null })
            await expect(service.linkUnit('client-1', 'cu-1', { source: 'inbox' })).rejects.toMatchObject({ status: 400 })
            expect(faturapi.createUnit).not.toHaveBeenCalled()
        })
    })

    it('deleteConnection remove na Faturapi e marca as UCs da conexao como sem credenciais', async () => {
        await service.deleteConnection('client-1', 'con_1')

        expect(faturapi.deleteConnection).toHaveBeenCalledWith('con_1')
        expect(prisma.consumerUnit.updateMany).toHaveBeenCalledWith({
            where: { faturapiConnectionId: 'con_1' },
            data: { faturapiStatus: 'needs_credentials', faturapiConnectionId: null },
        })
        expect(prisma.faturapiConnection.delete).toHaveBeenCalledWith({ where: { faturapiConnectionId: 'con_1' } })
    })

    it('resetEventForReprocess falha para evento inexistente ou ja processado', async () => {
        prisma.faturapiWebhookEvent.updateMany.mockResolvedValue({ count: 0 })
        await expect(service.resetEventForReprocess('evt_1')).rejects.toBeInstanceOf(FaturapiAdminError)
    })

    it('getOverview cruza unidades com as UCs do app e sugere UCs para as orfas', async () => {
        faturapi.listUnits.mockResolvedValue({
            data: [{ id: 'unt_111', uc: '111' }, { id: 'unt_222', uc: '222' }],
            nextCursor: null,
        })
        faturapi.listConnections.mockResolvedValue([connection])
        prisma.consumerUnit.findMany.mockResolvedValue([
            { id: 'cu-111', name: 'Casa', clientNumber: '111', faturapiUnitId: 'unt_111', client: { id: 'c1', name: 'Samia' } },
            { id: 'cu-222', name: 'Apto', clientNumber: '222', faturapiUnitId: null, client: { id: 'c1', name: 'Samia' } },
        ])
        faturapi.getBalance.mockRejectedValue(new Error('timeout'))

        const overview = await service.getOverview()

        expect(overview.units[0].consumerUnit?.id).toBe('cu-111')
        expect(overview.units[1].consumerUnit).toBeNull()
        expect(overview.units[1].candidates.map((c) => c.id)).toEqual(['cu-222'])
        expect(overview.connections[0].client).toBeNull()
        // Uma chamada falhando nao derruba a tela.
        expect(overview.balance).toBeNull()
        expect(overview.errors).toEqual(['timeout'])
    })
})
