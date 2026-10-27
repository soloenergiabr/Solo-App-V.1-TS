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
    lastError: FaturapiApiError | string | null;
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

export interface FaturapiApiError {
    code: string;
    message: string;
}

export type FaturapiConnectionStatus = 'syncing' | 'active' | 'needs_credentials' | 'error';

export interface FaturapiDiscoveredUnit {
    uc: string;
    name: string | null;
    address: string | null;
    monitored: boolean;
    unitId: string | null;
}

export interface FaturapiConnection {
    id: string;
    object: 'connection';
    provider: FaturapiProvider;
    source: 'pessoa' | 'empresa';
    status: FaturapiConnectionStatus;
    credentialsHint: string | null;
    discoveredUnits: FaturapiDiscoveredUnit[];
    lastSyncAt: string | null;
    lastError: FaturapiApiError | null;
    createdAt: string;
}

export type FaturapiExtractionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface FaturapiExtraction {
    id: string;
    object: 'extraction';
    provider: FaturapiProvider;
    source: FaturapiInvoiceSource;
    uc: string;
    months: string[];
    status: FaturapiExtractionStatus;
    stage: string;
    error: FaturapiApiError | null;
    costCents: number | null;
    unitId: string | null;
    trigger: 'api' | 'dashboard' | 'schedule' | 'backfill' | 'retry' | (string & {});
    createdAt: string;
    updatedAt: string;
    completedAt: string | null;
}

export interface FaturapiBalance {
    balanceCents: number;
    currency: string;
}

export interface FaturapiUsage {
    days: Array<{ date: string; completed: number; failed: number; costCents: number }>;
    totals: { completed: number; failed: number; costCents: number };
}

export interface UpdateUnitRequest {
    credentials?: FaturapiCredentials;
    label?: string;
    status?: 'active' | 'paused';
}

export interface CreateConnectionRequest {
    source: 'pessoa' | 'empresa';
    credentials: FaturapiCredentials;
    provider?: FaturapiProvider;
}

export interface AddConnectionUnitsRequest {
    ucs: string[] | 'all';
    backfill?: number;
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

export interface ListUnitsParams {
    status?: FaturapiUnitStatus;
    uc?: string;
    connectionId?: string;
    limit?: number;
    cursor?: string;
}

export interface ListExtractionsParams {
    status?: FaturapiExtractionStatus;
    uc?: string;
    limit?: number;
    cursor?: string;
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

export interface ConnectionEventData {
    connection: FaturapiConnection;
}
