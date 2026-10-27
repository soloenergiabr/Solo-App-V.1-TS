// Tipos da API Faturapi (https://app-d7d8c1-faturapi.guaracloud.com/llms-full.txt).
// Valores da fatura em reais; datas YYYY-MM-DD; referenceMonth em MM/AAAA.

export type FaturapiProvider = 'enel-ce' | (string & {});
export type FaturapiUnitSource = 'pessoa' | 'empresa' | 'inbox';
export type FaturapiInvoiceSource = 'pessoa' | 'empresa' | 'email';
export type FaturapiUnitStatus = 'active' | 'paused' | 'needs_credentials' | 'overdue';

export interface FaturapiCredentials {
    email: string;
    password: string;
}

export interface FaturapiUnit {
    id: string;
    object: 'unit';
    provider: FaturapiProvider;
    uc: string;
    source: FaturapiUnitSource;
    status: FaturapiUnitStatus;
    connectionId: string | null;
    credentialsHint: string | null;
    label: string | null;
    metadata: Record<string, string> | null;
    lastInvoiceMonth: string | null;
    lastInvoiceAt: string | null;
    lastCheckAt: string | null;
    nextCheckAt: string | null;
    expectedReadingDate: string | null;
    attempts: number;
    overdueSince: string | null;
    lastError: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface FaturapiInvoice {
    id: string;
    object: 'invoice';
    provider: FaturapiProvider;
    source: FaturapiInvoiceSource;
    uc: string;
    extractionId: string | null;
    referenceMonth: string; // MM/AAAA
    dueDate: string | null; // YYYY-MM-DD
    amount: number | null;
    barcode: string | null;
    pixCode: string | null;
    pdfUrl: string | null;
    pdfEncrypted: boolean;
    parseStatus: string;
    parsed: Record<string, unknown> | null;
    parseError: string | null;
    createdAt: string;
}

export interface FaturapiConnection {
    id: string;
    object: 'connection';
    [key: string]: unknown;
}

export interface FaturapiExtraction {
    id: string;
    object: 'extraction';
    status: string;
    [key: string]: unknown;
}

export interface CreateUnitRequest {
    uc: string;
    source: FaturapiUnitSource;
    provider?: FaturapiProvider;
    credentials?: FaturapiCredentials;
    label?: string;
    backfill?: number; // 0 a 24
}

export interface CreateUnitResponse {
    unit: FaturapiUnit;
    extractions: FaturapiExtraction[];
}

export interface ListInvoicesParams {
    uc?: string;
    month?: string; // MM/AAAA
    source?: FaturapiInvoiceSource;
    limit?: number;
    cursor?: string;
}

export interface FaturapiPage<T> {
    data: T[];
    nextCursor: string | null;
}

export type FaturapiEventType =
    | 'extraction.completed'
    | 'extraction.failed'
    | 'extraction.processing'
    | 'invoice.received'
    | 'unit.overdue'
    | 'unit.credentials_invalid'
    | 'connection.synced'
    | 'connection.failed';

export interface FaturapiWebhookEvent<TData = Record<string, unknown>> {
    id: string;
    type: FaturapiEventType;
    createdAt: string;
    data: TData;
}

export interface InvoiceReceivedData {
    invoice: FaturapiInvoice;
    unit?: FaturapiUnit;
}

export interface UnitOverdueData {
    unit: FaturapiUnit;
}

export interface UnitCredentialsInvalidData {
    unit?: FaturapiUnit;
    connection?: FaturapiConnection;
}
