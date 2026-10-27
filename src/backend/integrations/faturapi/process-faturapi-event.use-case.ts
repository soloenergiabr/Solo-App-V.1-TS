import { Prisma, PrismaClient } from '@/app/generated/prisma';
import { analyzeBillPdf } from '@/backend/economia/bill-pdf-analysis';
import { eventBus, EventType } from '@/backend/shared/event-bus';
import { uploadObject } from '@/lib/object-storage';
import { FaturapiClient } from './faturapi.client';
import type {
    FaturapiInvoice,
    FaturapiUnit,
    FaturapiWebhookEvent,
    InvoiceReceivedData,
    UnitCredentialsInvalidData,
    UnitOverdueData,
} from './faturapi.types';

type UploadFn = typeof uploadObject;
type AnalyzeFn = typeof analyzeBillPdf;

/** "MM/AAAA" -> { referenceMonth, referenceYear } */
export function parseReferenceMonth(value: string): { referenceMonth: number; referenceYear: number } {
    const match = /^(\d{1,2})\/(\d{4})$/.exec(value?.trim() ?? '');
    const referenceMonth = match ? Number(match[1]) : NaN;
    const referenceYear = match ? Number(match[2]) : NaN;
    if (!match || referenceMonth < 1 || referenceMonth > 12) {
        throw new Error(`Invalid Faturapi referenceMonth: ${value}`);
    }
    return { referenceMonth, referenceYear };
}

export class ProcessFaturapiEventUseCase {
    constructor(
        private prisma: PrismaClient,
        private faturapi: Pick<FaturapiClient, 'downloadPdf'>,
        private upload: UploadFn = uploadObject,
        private analyze: AnalyzeFn = analyzeBillPdf,
    ) { }

    async execute(event: FaturapiWebhookEvent): Promise<void> {
        switch (event.type) {
            case 'invoice.received':
                return this.handleInvoiceReceived(event.data as unknown as InvoiceReceivedData);
            case 'unit.overdue':
                return this.handleUnitOverdue(event.data as unknown as UnitOverdueData);
            case 'unit.credentials_invalid':
                return this.handleCredentialsInvalid(event.data as unknown as UnitCredentialsInvalidData);
            default:
                console.log(`[Faturapi] Evento ${event.type} (${event.id}) ignorado.`);
        }
    }

    private async findConsumerUnits(unit: FaturapiUnit | undefined, uc: string | undefined) {
        if (unit?.id) {
            const linked = await this.prisma.consumerUnit.findMany({
                where: { faturapiUnitId: unit.id, deletedAt: null },
            });
            if (linked.length > 0) return linked;
        }

        const clientNumber = uc ?? unit?.uc;
        if (!clientNumber) return [];
        return this.prisma.consumerUnit.findMany({
            where: { clientNumber, deletedAt: null },
        });
    }

    private async handleInvoiceReceived({ invoice, unit }: InvoiceReceivedData): Promise<void> {
        const units = await this.findConsumerUnits(unit, invoice.uc);
        if (units.length === 0) {
            throw new Error(`Consumer unit not found for Faturapi UC ${invoice.uc}`);
        }
        if (units.length > 1) {
            throw new Error(`Ambiguous Faturapi UC ${invoice.uc}: ${units.length} consumer units match`);
        }
        const consumerUnit = units[0];

        const { referenceMonth, referenceYear } = parseReferenceMonth(invoice.referenceMonth);
        const key = { consumerUnitId: consumerUnit.id, referenceMonth, referenceYear };
        const existing = await this.prisma.energyBill.findUnique({
            where: { consumerUnitId_referenceMonth_referenceYear: key },
        });

        const faturapiData = {
            faturapiInvoiceId: invoice.id,
            faturapiParsed: (invoice.parsed ?? Prisma.JsonNull) as Prisma.InputJsonValue,
            amountDue: invoice.amount,
            dueDate: invoice.dueDate ? new Date(invoice.dueDate) : null,
            barcode: invoice.barcode,
            pixCode: invoice.pixCode,
        };

        const needsFile = !existing?.rawBillFileKey;
        // Fatura criada por upload/admin nao e reanalisada (preserva o que ja foi preenchido).
        const needsAnalysis = !existing || (existing.faturapiInvoiceId != null && !existing.aiAnalysis);
        const pdf = needsFile || needsAnalysis ? await this.downloadPdf(invoice) : null;

        const file = pdf && needsFile ? await this.storePdf(pdf, invoice, consumerUnit.clientId, consumerUnit.id) : null;
        const analyzed = pdf && needsAnalysis ? await this.analyzePdf(pdf, invoice, consumerUnit) : null;

        // Valor, vencimento e codigos de pagamento da Faturapi prevalecem sobre a
        // extracao por IA; o mes de referencia tambem (vem da distribuidora).
        const totalBillValue = invoice.amount ?? analyzed?.totalBillValue ?? null;

        const bill = await this.prisma.energyBill.upsert({
            where: { consumerUnitId_referenceMonth_referenceYear: key },
            // Fatura ja existente vinda de upload/admin: so completa os dados de pagamento,
            // sem sobrescrever o que o analisador ou o admin ja preencheram.
            update: {
                ...(analyzed ?? {}),
                ...faturapiData,
                ...(existing?.totalBillValue == null || analyzed ? { totalBillValue } : {}),
                ...(file ?? {}),
            },
            create: {
                accountHolder: consumerUnit.accountHolder,
                accountNumber: consumerUnit.accountNumber,
                clientNumber: consumerUnit.clientNumber,
                instalationNumber: consumerUnit.installationNumber,
                distributor: consumerUnit.distributor,
                ...(analyzed ?? {}),
                ...key,
                ...faturapiData,
                ...(file ?? {}),
                clientId: consumerUnit.clientId,
                plantId: consumerUnit.plantId,
                competenceDate: new Date(referenceYear, referenceMonth - 1, 1),
                totalBillValue,
                status: 'draft',
            },
        });

        await this.prisma.consumerUnit.update({
            where: { id: consumerUnit.id },
            data: {
                faturapiUnitId: consumerUnit.faturapiUnitId ?? unit?.id,
                faturapiStatus: unit?.status ?? 'active',
            },
        });

        eventBus.emit(EventType.BILL_UPLOADED, {
            billId: bill.id,
            clientId: consumerUnit.clientId,
            consumerUnitId: consumerUnit.id,
        });
    }

    private async downloadPdf(invoice: FaturapiInvoice): Promise<Buffer | null> {
        try {
            return await this.faturapi.downloadPdf(invoice.id);
        } catch (error) {
            // Os dados da fatura sao salvos mesmo sem o PDF.
            console.error(`[Faturapi] Falha ao baixar PDF da fatura ${invoice.id}:`, error);
            return null;
        }
    }

    private async storePdf(buffer: Buffer, invoice: FaturapiInvoice, clientId: string, consumerUnitId: string) {
        try {
            const uploaded = await this.upload({
                key: ['energy-bills', clientId, consumerUnitId, `${Date.now()}-faturapi-${invoice.id}.pdf`].join('/'),
                body: buffer,
                contentType: 'application/pdf',
            });
            return {
                billFileUrl: uploaded.url,
                rawBillFileKey: uploaded.key,
                rawBillFileSize: buffer.byteLength,
            };
        } catch (error) {
            console.error(`[Faturapi] Falha ao armazenar PDF da fatura ${invoice.id}:`, error);
            return null;
        }
    }

    /** Mesma analise do upload manual (extracao por IA + flags + recomendacoes). */
    private async analyzePdf(
        buffer: Buffer,
        invoice: FaturapiInvoice,
        consumerUnit: Parameters<AnalyzeFn>[0]['fallback'],
    ) {
        try {
            const { fields } = await this.analyze({ buffer, mimeType: 'application/pdf', fallback: consumerUnit });
            return fields;
        } catch (error) {
            // A fatura e salva sem analise; da para reprocessar o evento depois.
            console.error(`[Faturapi] Falha ao analisar a fatura ${invoice.id}:`, error);
            return null;
        }
    }

    private async handleUnitOverdue({ unit }: UnitOverdueData): Promise<void> {
        const units = await this.findConsumerUnits(unit, undefined);
        if (units.length === 0) {
            throw new Error(`Consumer unit not found for Faturapi unit ${unit?.id}`);
        }

        await this.prisma.consumerUnit.updateMany({
            where: { id: { in: units.map((u) => u.id) } },
            data: { faturapiStatus: 'overdue' },
        });

        for (const consumerUnit of units) {
            eventBus.emit(EventType.FATURAPI_UNIT_OVERDUE, {
                consumerUnitId: consumerUnit.id,
                clientId: consumerUnit.clientId,
                overdueSince: unit.overdueSince,
            });
        }
    }

    private async handleCredentialsInvalid({ unit, connection }: UnitCredentialsInvalidData): Promise<void> {
        if (!unit) {
            // As UCs sao vinculadas direto por unidade (createUnit), sem conexoes.
            console.warn(`[Faturapi] credentials_invalid para conexao ${connection?.id} sem unidade vinculada; ignorado.`);
            return;
        }

        const units = await this.findConsumerUnits(unit, undefined);
        if (units.length === 0) {
            throw new Error(`Consumer unit not found for Faturapi unit ${unit.id}`);
        }

        await this.prisma.consumerUnit.updateMany({
            where: { id: { in: units.map((u) => u.id) } },
            data: { faturapiStatus: 'needs_credentials' },
        });

        eventBus.emit(EventType.FATURAPI_CREDENTIALS_INVALID, {
            consumerUnitIds: units.map((u) => u.id),
            clientIds: [...new Set(units.map((u) => u.clientId))],
        });
    }
}
