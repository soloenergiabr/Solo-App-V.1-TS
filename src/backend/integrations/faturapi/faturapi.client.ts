import type {
    CreateUnitRequest,
    CreateUnitResponse,
    FaturapiInvoice,
    FaturapiPage,
    FaturapiUnit,
    ListInvoicesParams,
} from './faturapi.types';

// Uso exclusivo no servidor: FATURAPI_KEY nunca pode chegar ao bundle do cliente.

const DEFAULT_BASE_URL = 'https://app-d7d8c1-faturapi.guaracloud.com/v1';
const MAX_RETRY_AFTER_SECONDS = 60;

export class FaturapiError extends Error {
    constructor(
        public readonly status: number,
        public readonly code: string,
        message: string,
    ) {
        super(`[Faturapi] ${status} ${code}: ${message}`);
        this.name = 'FaturapiError';
    }
}

type FetchFn = typeof fetch;

export interface FaturapiClientOptions {
    apiKey?: string;
    baseUrl?: string;
    fetchFn?: FetchFn;
}

export class FaturapiClient {
    private readonly apiKey: string;
    private readonly baseUrl: string;
    private readonly fetchFn: FetchFn;

    constructor(options: FaturapiClientOptions = {}) {
        const apiKey = options.apiKey ?? process.env.FATURAPI_KEY;
        if (!apiKey) {
            throw new Error('FATURAPI_KEY is not defined in environment variables.');
        }
        this.apiKey = apiKey;
        this.baseUrl = (options.baseUrl ?? process.env.FATURAPI_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, '');
        this.fetchFn = options.fetchFn ?? fetch;
    }

    async createUnit(input: CreateUnitRequest): Promise<CreateUnitResponse> {
        return this.request<CreateUnitResponse>('POST', '/units', input);
    }

    async getUnit(unitId: string): Promise<FaturapiUnit> {
        const { unit } = await this.request<{ unit: FaturapiUnit }>('GET', `/units/${encodeURIComponent(unitId)}`);
        return unit;
    }

    async listInvoices(params: ListInvoicesParams = {}): Promise<FaturapiPage<FaturapiInvoice>> {
        const query = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
        }
        const suffix = query.size > 0 ? `?${query.toString()}` : '';
        return this.request<FaturapiPage<FaturapiInvoice>>('GET', `/invoices${suffix}`);
    }

    /** Percorre todas as paginas de listInvoices ate nextCursor ser null. */
    async listAllInvoices(params: Omit<ListInvoicesParams, 'cursor'> = {}): Promise<FaturapiInvoice[]> {
        const invoices: FaturapiInvoice[] = [];
        let cursor: string | undefined;
        do {
            const page = await this.listInvoices({ ...params, cursor });
            invoices.push(...page.data);
            cursor = page.nextCursor ?? undefined;
        } while (cursor);
        return invoices;
    }

    /**
     * GET /invoices/:id/pdf responde com redirect para uma URL assinada de curta
     * duracao. O redirect e seguido manualmente para nao reenviar o Bearer token
     * ao host do storage.
     */
    async downloadPdf(invoiceId: string): Promise<Buffer> {
        const response = await this.send('GET', `/invoices/${encodeURIComponent(invoiceId)}/pdf`, undefined, 'manual');

        const location = response.headers.get('location');
        if (response.status >= 300 && response.status < 400 && location) {
            const signed = await this.fetchFn(new URL(location, this.baseUrl).toString());
            if (!signed.ok) {
                throw new FaturapiError(signed.status, 'pdf_download_failed', `Falha ao baixar PDF da fatura ${invoiceId}`);
            }
            return Buffer.from(await signed.arrayBuffer());
        }

        if (!response.ok) await this.throwApiError(response);
        return Buffer.from(await response.arrayBuffer());
    }

    private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
        const response = await this.send(method, path, body);
        if (!response.ok) await this.throwApiError(response);
        if (response.status === 204) return undefined as T;
        return (await response.json()) as T;
    }

    private async send(
        method: string,
        path: string,
        body?: unknown,
        redirect: RequestRedirect = 'follow',
        retried = false,
    ): Promise<Response> {
        const response = await this.fetchFn(`${this.baseUrl}${path}`, {
            method,
            redirect,
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                Accept: 'application/json',
                ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
            },
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });

        // Rate limit: 120 req/min por chave. Uma unica nova tentativa respeitando Retry-After.
        if (response.status === 429 && !retried) {
            const retryAfter = Number(response.headers.get('retry-after'));
            const waitSeconds = Number.isFinite(retryAfter) && retryAfter > 0
                ? Math.min(retryAfter, MAX_RETRY_AFTER_SECONDS)
                : 1;
            await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));
            return this.send(method, path, body, redirect, true);
        }

        return response;
    }

    private async throwApiError(response: Response): Promise<never> {
        let code = 'unknown_error';
        let message = response.statusText || 'Erro na Faturapi';
        try {
            const payload = (await response.json()) as { error?: { code?: string; message?: string } };
            code = payload.error?.code ?? code;
            message = payload.error?.message ?? message;
        } catch {
            // corpo nao-JSON; mantem status/statusText
        }
        throw new FaturapiError(response.status, code, message);
    }
}
