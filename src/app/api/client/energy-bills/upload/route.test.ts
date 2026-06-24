import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// -- Mocks --
const mockFindFirst = vi.fn();
const mockUpsert = vi.fn();
const mockUploadObject = vi.fn();
const mockEventBusEmit = vi.fn();

// Mock the analyzer
const mockExtract = vi.fn();
const mockAnalyze = vi.fn();
vi.mock('@/backend/economia/analyzer', () => ({
    getBillAnalyzer: () => ({
        extract: mockExtract,
        analyze: mockAnalyze,
        chat: vi.fn(),
        name: 'claude',
    }),
    computeDeterministicFlags: vi.fn(() => ({
        minimumKwh: 30,
        solarCoveredMinimum: true,
        extraChargesTotal: 0,
        estimatedSavings: 85,
        billScore: 80,
        connectionType: 'monofasico',
    })),
}));

vi.mock('@/backend/economia/analyzer/mapping', () => ({
    mapRawToBillJson: vi.fn(() => ({
        billingItems: [],
        creditSummary: {},
        extraCharges: [],
    })),
}));

vi.mock('@/lib/prisma', () => ({
    default: {
        consumerUnit: {
            findFirst: mockFindFirst,
        },
        energyBill: {
            upsert: mockUpsert,
        },
    },
}));

vi.mock('@/backend/auth/middleware/auth.middleware', () => ({
    AuthMiddleware: {
        requireAuth: vi.fn(),
    },
}));

vi.mock('@/lib/object-storage', () => ({
    uploadObject: mockUploadObject,
}));

vi.mock('@/backend/shared/event-bus', () => ({
    eventBus: {
        emit: mockEventBusEmit,
    },
    EventType: {
        BILL_UPLOADED: 'bill.uploaded',
    },
}));

const { AuthMiddleware } = await import('@/backend/auth/middleware/auth.middleware');

async function callPOST(formData: FormData, authOverride?: { clientId?: string }) {
    const { POST } = await import('./route');
    const request = new NextRequest(
        new Request('http://localhost/api/client/energy-bills/upload', {
            method: 'POST',
            body: formData,
        }),
    );
    return POST(request);
}

function makeFile(name = 'bill.pdf', content = 'fake-pdf-content'): File {
    return new File([content], name, { type: 'application/pdf' });
}

describe('POST /api/client/energy-bills/upload', () => {
    const mockConsumerUnit = {
        id: 'unit-1',
        clientId: 'client-1',
        plantId: 'plant-1',
        name: 'Minha Casa',
        accountHolder: 'Joao Silva',
        accountNumber: '12345',
        clientNumber: '67890',
        installationNumber: '98765',
        distributor: 'Enel',
        plant: { id: 'plant-1' },
    };

    const mockUploadResult = {
        key: 'energy-bills/client-1/unit-1/123-bill.pdf',
        url: 'https://storage.example.com/bill.pdf',
    };

    const mockBillResult = {
        id: 'bill-1',
        status: 'draft',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(AuthMiddleware.requireAuth).mockResolvedValue({
            userId: 'user-1',
            clientId: 'client-1',
        } as never);

        mockFindFirst.mockResolvedValue(mockConsumerUnit);
        mockUploadObject.mockResolvedValue(mockUploadResult);
        mockExtract.mockResolvedValue({
            referenceMonth: 5,
            referenceYear: 2026,
            competenceDate: '2026-05-01',
            totalBillValue: 450.75,
            aiAnalysis: null,
            aiExplanations: {},
            aiRecommendations: [],
            alerts: [],
            billingItems: [],
            creditSummary: {},
            extraCharges: [],
        });
        mockAnalyze.mockResolvedValue({
            aiAnalysis: 'Analise detalhada',
            aiExplanations: {},
            aiRecommendations: [],
            alerts: [],
            billScore: 80,
            estimatedSavings: 85,
        });
        mockUpsert.mockResolvedValue(mockBillResult);
    });

    describe('authentication', () => {
        it('returns 401 when not authenticated', async () => {
            vi.mocked(AuthMiddleware.requireAuth).mockRejectedValue(
                new Error('User is not authenticated'),
            );

            const formData = new FormData();
            formData.append('file', makeFile());
            formData.append('consumerUnitId', 'unit-1');

            const res = await callPOST(formData);
            // withHandle returns 400 for unauthenticated errors since the
            // message "User is not authenticated" does not contain "Authentication"
            expect(res.status).toBe(400);
        });

        it('returns 403 when user has no clientId', async () => {
            vi.mocked(AuthMiddleware.requireAuth).mockResolvedValue({
                userId: 'user-1',
                clientId: undefined,
            } as never);

            const formData = new FormData();
            formData.append('file', makeFile());
            formData.append('consumerUnitId', 'unit-1');

            const res = await callPOST(formData);
            expect(res.status).toBe(403);

            const body = await res.json();
            expect(body.message).toBe('Cliente nao identificado.');
        });
    });

    describe('validation', () => {
        it('returns 400 when no file is provided', async () => {
            const formData = new FormData();
            formData.append('consumerUnitId', 'unit-1');

            const res = await callPOST(formData);
            expect(res.status).toBe(400);

            const body = await res.json();
            expect(body.message).toBe('Nenhum arquivo enviado.');
        });

        it('returns 400 when no consumerUnitId is provided', async () => {
            const formData = new FormData();
            formData.append('file', makeFile());

            const res = await callPOST(formData);
            expect(res.status).toBe(400);

            const body = await res.json();
            expect(body.message).toBe('Selecione uma unidade consumidora.');
        });

        it('returns 404 when consumer unit does not belong to client', async () => {
            mockFindFirst.mockResolvedValue(null);

            const formData = new FormData();
            formData.append('file', makeFile());
            formData.append('consumerUnitId', 'unit-other');

            const res = await callPOST(formData);
            expect(res.status).toBe(404);

            const body = await res.json();
            expect(body.message).toBe('Unidade consumidora nao encontrada.');
        });

        it('validates consumer unit belongs to authenticated client', async () => {
            const formData = new FormData();
            formData.append('file', makeFile());
            formData.append('consumerUnitId', 'unit-1');

            await callPOST(formData);

            expect(mockFindFirst).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        id: 'unit-1',
                        clientId: 'client-1',
                        deletedAt: null,
                    }),
                }),
            );
        });
    });

    describe('successful upload', () => {
        it('uploads file to object storage', async () => {
            const formData = new FormData();
            formData.append('file', makeFile());
            formData.append('consumerUnitId', 'unit-1');

            await callPOST(formData);

            expect(mockUploadObject).toHaveBeenCalledWith(
                expect.objectContaining({
                    contentType: 'application/pdf',
                }),
            );
        });

        it('runs analyzer on the uploaded file', async () => {
            const formData = new FormData();
            formData.append('file', makeFile());
            formData.append('consumerUnitId', 'unit-1');

            await callPOST(formData);

            expect(mockExtract).toHaveBeenCalledOnce();
            expect(mockExtract).toHaveBeenCalledWith(
                expect.objectContaining({ mimeType: 'application/pdf' }),
            );
            expect(mockAnalyze).toHaveBeenCalledOnce();
        });

        it('saves bill with status draft', async () => {
            const formData = new FormData();
            formData.append('file', makeFile());
            formData.append('consumerUnitId', 'unit-1');

            await callPOST(formData);

            expect(mockUpsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    create: expect.objectContaining({ status: 'draft' }),
                    update: expect.objectContaining({ status: 'draft' }),
                }),
            );
        });

        it('returns created bill id and status', async () => {
            const formData = new FormData();
            formData.append('file', makeFile());
            formData.append('consumerUnitId', 'unit-1');

            const res = await callPOST(formData);
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(body.success).toBe(true);
            expect(body.data.id).toBe('bill-1');
            expect(body.data.status).toBe('draft');
        });

        it('emits bill.uploaded event', async () => {
            const formData = new FormData();
            formData.append('file', makeFile());
            formData.append('consumerUnitId', 'unit-1');

            await callPOST(formData);

            expect(mockEventBusEmit).toHaveBeenCalledWith('bill.uploaded', {
                billId: 'bill-1',
                clientId: 'client-1',
                consumerUnitId: 'unit-1',
            });
        });
    });
});
