import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockEmit = vi.fn()
vi.mock('@/backend/shared/event-bus', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/backend/shared/event-bus')>()
    return { ...actual, eventBus: { emit: mockEmit } }
})
vi.mock('@/lib/object-storage', () => ({ uploadObject: vi.fn() }))

const { ProcessFaturapiEventUseCase, parseReferenceMonth } = await import('../process-faturapi-event.use-case')
type UseCaseArgs = ConstructorParameters<typeof ProcessFaturapiEventUseCase>
type FaturapiEvent = Parameters<InstanceType<typeof ProcessFaturapiEventUseCase>['execute']>[0]
const { EventType } = await import('@/backend/shared/event-bus')

const consumerUnit = {
    id: 'cu-1',
    clientId: 'client-1',
    plantId: 'plant-1',
    clientNumber: '7604645',
    installationNumber: 'INST-1',
    accountHolder: 'Maria',
    accountNumber: 'ACC-1',
    distributor: 'Enel CE',
    faturapiUnitId: null as string | null,
}

const invoice = {
    id: 'inv_1',
    object: 'invoice',
    provider: 'enel-ce',
    source: 'pessoa',
    uc: '7604645',
    extractionId: 'ext_1',
    referenceMonth: '09/2026',
    dueDate: '2026-10-15',
    amount: 312.45,
    barcode: '83640000003',
    pixCode: '00020126...',
    pdfUrl: null,
    pdfEncrypted: false,
    parseStatus: 'parsed',
    parsed: { charges: { total: 312.45 } },
    parseError: null,
    createdAt: '2026-10-01T00:00:00Z',
}

function makePrisma() {
    return {
        consumerUnit: {
            findMany: vi.fn().mockResolvedValue([consumerUnit]),
            update: vi.fn(),
            updateMany: vi.fn(),
        },
        energyBill: {
            findUnique: vi.fn().mockResolvedValue(null),
            upsert: vi.fn().mockResolvedValue({ id: 'bill-1' }),
        },
    }
}

function event(type: string, data: unknown) {
    return { id: 'evt_1', type, createdAt: '2026-10-25T12:00:00Z', data } as unknown as FaturapiEvent
}

describe('parseReferenceMonth', () => {
    it('converte MM/AAAA', () => {
        expect(parseReferenceMonth('09/2026')).toEqual({ referenceMonth: 9, referenceYear: 2026 })
    })

    it.each(['2026-09', '13/2026', '', '9-2026'])('rejeita %s', (value) => {
        expect(() => parseReferenceMonth(value)).toThrow()
    })
})

describe('ProcessFaturapiEventUseCase', () => {
    let prisma: ReturnType<typeof makePrisma>
    const downloadPdf = vi.fn()
    const upload = vi.fn()

    beforeEach(() => {
        prisma = makePrisma()
        mockEmit.mockReset()
        downloadPdf.mockReset().mockResolvedValue(Buffer.from('%PDF'))
        upload.mockReset().mockResolvedValue({ key: 'energy-bills/k.pdf', url: 'https://s3/k.pdf' })
    })

    const run = (e: FaturapiEvent) =>
        new ProcessFaturapiEventUseCase(prisma as unknown as UseCaseArgs[0], { downloadPdf }, upload).execute(e)

    it('invoice.received cria a fatura na chave (UC, mes, ano) com os campos da Faturapi e o PDF', async () => {
        await run(event('invoice.received', { invoice }))

        expect(prisma.consumerUnit.findMany).toHaveBeenCalledWith({
            where: { clientNumber: '7604645', deletedAt: null },
        })

        const args = prisma.energyBill.upsert.mock.calls[0][0]
        expect(args.where).toEqual({
            consumerUnitId_referenceMonth_referenceYear: { consumerUnitId: 'cu-1', referenceMonth: 9, referenceYear: 2026 },
        })
        expect(args.create).toMatchObject({
            consumerUnitId: 'cu-1',
            clientId: 'client-1',
            plantId: 'plant-1',
            referenceMonth: 9,
            referenceYear: 2026,
            competenceDate: new Date(2026, 8, 1),
            totalBillValue: 312.45,
            amountDue: 312.45,
            dueDate: new Date('2026-10-15'),
            barcode: '83640000003',
            pixCode: '00020126...',
            faturapiInvoiceId: 'inv_1',
            faturapiParsed: { charges: { total: 312.45 } },
            rawBillFileKey: 'energy-bills/k.pdf',
            billFileUrl: 'https://s3/k.pdf',
            status: 'draft',
        })
        expect(downloadPdf).toHaveBeenCalledWith('inv_1')
        expect(mockEmit).toHaveBeenCalledWith(EventType.BILL_UPLOADED, {
            billId: 'bill-1', clientId: 'client-1', consumerUnitId: 'cu-1',
        })
    })

    it('invoice.received em fatura ja existente nao sobrescreve PDF nem valor total', async () => {
        prisma.energyBill.findUnique.mockResolvedValue({ id: 'bill-1', rawBillFileKey: 'manual.pdf', totalBillValue: 300 })

        await run(event('invoice.received', { invoice }))

        const { update } = prisma.energyBill.upsert.mock.calls[0][0]
        expect(downloadPdf).not.toHaveBeenCalled()
        expect(update).not.toHaveProperty('rawBillFileKey')
        expect(update).not.toHaveProperty('totalBillValue')
        expect(update).toMatchObject({ amountDue: 312.45, pixCode: '00020126...', faturapiInvoiceId: 'inv_1' })
    })

    it('invoice.received salva a fatura mesmo se o download do PDF falhar', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
        downloadPdf.mockRejectedValue(new Error('timeout'))

        await run(event('invoice.received', { invoice }))

        expect(prisma.energyBill.upsert).toHaveBeenCalled()
        expect(prisma.energyBill.upsert.mock.calls[0][0].create).not.toHaveProperty('rawBillFileKey')
    })

    it('invoice.received prefere o vinculo por faturapiUnitId e grava o status da unidade', async () => {
        await run(event('invoice.received', { invoice, unit: { id: 'unit_9', uc: '7604645', status: 'active' } }))

        expect(prisma.consumerUnit.findMany).toHaveBeenNthCalledWith(1, {
            where: { faturapiUnitId: 'unit_9', deletedAt: null },
        })
        expect(prisma.consumerUnit.update).toHaveBeenCalledWith({
            where: { id: 'cu-1' },
            data: { faturapiUnitId: 'unit_9', faturapiStatus: 'active' },
        })
    })

    it('invoice.received falha se a UC nao existe ou e ambigua', async () => {
        prisma.consumerUnit.findMany.mockResolvedValue([])
        await expect(run(event('invoice.received', { invoice }))).rejects.toThrow(/not found/)

        prisma.consumerUnit.findMany.mockResolvedValue([consumerUnit, { ...consumerUnit, id: 'cu-2' }])
        await expect(run(event('invoice.received', { invoice }))).rejects.toThrow(/Ambiguous/)
        expect(prisma.energyBill.upsert).not.toHaveBeenCalled()
    })

    it('unit.overdue marca a UC como overdue e emite evento', async () => {
        await run(event('unit.overdue', { unit: { id: 'unit_9', uc: '7604645', overdueSince: '2026-10-20' } }))

        expect(prisma.consumerUnit.updateMany).toHaveBeenCalledWith({
            where: { id: { in: ['cu-1'] } },
            data: { faturapiStatus: 'overdue' },
        })
        expect(mockEmit).toHaveBeenCalledWith(EventType.FATURAPI_UNIT_OVERDUE, {
            consumerUnitId: 'cu-1', clientId: 'client-1', overdueSince: '2026-10-20',
        })
    })

    it('unit.credentials_invalid marca a UC como needs_credentials e emite evento', async () => {
        await run(event('unit.credentials_invalid', { unit: { id: 'unit_9', uc: '7604645' } }))

        expect(prisma.consumerUnit.updateMany).toHaveBeenCalledWith({
            where: { id: { in: ['cu-1'] } },
            data: { faturapiStatus: 'needs_credentials' },
        })
        expect(mockEmit).toHaveBeenCalledWith(EventType.FATURAPI_CREDENTIALS_INVALID, {
            consumerUnitIds: ['cu-1'], clientIds: ['client-1'],
        })
    })

    it('ignora eventos nao tratados', async () => {
        vi.spyOn(console, 'log').mockImplementation(() => {})
        await run(event('extraction.completed', {}))
        expect(prisma.energyBill.upsert).not.toHaveBeenCalled()
        expect(prisma.consumerUnit.updateMany).not.toHaveBeenCalled()
    })
})
