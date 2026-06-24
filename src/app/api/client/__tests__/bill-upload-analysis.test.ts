import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockExtractResult = {
  referenceMonth: 6,
  referenceYear: 2026,
  competenceDate: '2026-06-01',
  accountHolder: 'João Silva',
  accountNumber: '123456',
  clientNumber: '789012',
  instalationNumber: '345678',
  distributor: 'CEMIG',
  consumerClass: 'Residencial',
  tariffModality: 'Branca',
  connectionType: 'trifasico',
  tariffPeriod: 'Posto',
  billingDays: 30,
  readingPeriodFrom: '2026-05-01',
  readingPeriodTo: '2026-05-31',
  creditExpiryDate: null,
  monitoredGenerationKwh: null,
  billedConsumptionKwh: 500,
  consumptionKwh: 500,
  realConsumptionKwh: 500,
  injectedEnergyKwh: 200,
  compensatedEnergyKwh: 200,
  previousCreditsKwh: 0,
  currentCreditsKwh: 50,
  expectedGenerationKwh: null,
  generationEfficiency: null,
  meterReadingCurrent: 12345,
  meterReadingPrevious: 11845,
  demandContractedKw: null,
  demandMeasuredKw: null,
  totalBillValue: 350,
  totalAmount: 350,
  energyCost: 250,
  availabilityCost: 50,
  publicLightingCost: 30,
  icmsCost: null,
  pisCost: null,
  cofinsCost: null,
  pisCofinsCost: null,
  tariffPerKwh: 0.85,
  tariffTeValue: null,
  tariffTusdValue: null,
  tariffFlag: 'Vermelha',
  tariffFlagCost: 15.5,
  sectoralCharges: null,
  fineAmount: null,
  interestAmount: null,
  otherCharges: null,
  estimatedSavings: null,
  billingItems: [],
  creditSummary: {},
  extraCharges: [],
  alerts: [],
  aiAnalysis: null,
  aiExplanations: {},
  aiRecommendations: [],
  billScore: null,
};

const mockAnalyzeResult = {
  aiAnalysis: 'Análise detalhada da fatura com recomendações de economia.',
  aiExplanations: { consumo: 'Consumo dentro da média mensal' },
  aiRecommendations: ['Reduzir consumo na ponta', 'Avaliar migração para tarifa verde'],
  alerts: ['Bandeira vermelha acionada'],
  billScore: 75,
  estimatedSavings: 120.5,
};

const mockJsonColumns = {
  billingItems: [{ description: 'Consumo kWh', quantity_kwh: 500, total_value: 350 }],
  creditSummary: { injected_kwh: 200, used_kwh: 150, balance_kwh: 50, expiring_kwh: 0 },
  extraCharges: [{ description: 'Bandeira vermelha', value: 15.5, type: 'service' }],
};

const mockFlags = {
  minimumKwh: 100,
  solarCoveredMinimum: true,
  extraChargesTotal: 45.5,
  estimatedSavings: 120.5,
  billScore: 75,
  connectionType: 'trifasico',
};

// ---------------------------------------------------------------------------
// Mocks must be defined before any imports that use them
// ---------------------------------------------------------------------------

vi.mock('@/backend/economia/analyzer', () => ({
  getBillAnalyzer: vi.fn(),
  computeDeterministicFlags: vi.fn(),
}));

vi.mock('@/backend/economia/analyzer/mapping', () => ({
  mapRawToBillJson: vi.fn(() => mockJsonColumns),
}));

vi.mock('@/lib/object-storage', () => ({
  uploadObject: vi.fn(),
}));

vi.mock('@/backend/auth/middleware/auth.middleware', () => ({
  AuthMiddleware: {
    requireAuth: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    consumerUnit: {
      findFirst: vi.fn(),
    },
    energyBill: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock('@/backend/shared/event-bus', () => ({
  eventBus: {
    emit: vi.fn(),
  },
  EventType: {
    BILL_UPLOADED: 'bill.uploaded',
  },
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import prisma from '@/lib/prisma';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { getBillAnalyzer, computeDeterministicFlags } from '@/backend/economia/analyzer';
import { mapRawToBillJson } from '@/backend/economia/analyzer/mapping';
import { uploadObject } from '@/lib/object-storage';
import { eventBus, EventType } from '@/backend/shared/event-bus';

const { POST } = await import('../energy-bills/upload/route');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockUploadRequest(): NextRequest {
  const mockFile = {
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(10)),
    name: 'bill.pdf',
    type: 'application/pdf',
  } as unknown as File;

  return {
    formData: () =>
      Promise.resolve({
        get: (key: string) => {
          if (key === 'file') return mockFile;
          if (key === 'consumerUnitId') return 'test-uc';
          return null;
        },
      }),
  } as unknown as NextRequest;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/client/energy-bills/upload — full extract→analyze→persist pipeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('runs the full pipeline and merges analysis + mapping into the upserted bill', async () => {
    // -----------------------------------------------------------------------
    // Arrange
    // -----------------------------------------------------------------------
    const mockAnalyzer = {
      name: 'claude',
      extract: vi.fn().mockResolvedValue(mockExtractResult),
      analyze: vi.fn().mockResolvedValue(mockAnalyzeResult),
      chat: vi.fn(),
    };

    vi.mocked(getBillAnalyzer).mockReturnValue(mockAnalyzer as any);
    vi.mocked(computeDeterministicFlags).mockReturnValue(mockFlags);
    vi.mocked(AuthMiddleware.requireAuth).mockResolvedValue({ clientId: 'test-client' } as any);
    vi.mocked(uploadObject).mockResolvedValue({ url: 'https://test.url', key: 'test-key' });
    vi.mocked(prisma.consumerUnit.findFirst).mockResolvedValue({
      id: 'test-uc',
      clientId: 'test-client',
      plantId: 'test-plant',
      accountHolder: null,
      accountNumber: null,
      clientNumber: null,
      installationNumber: null,
      distributor: null,
    } as any);
    vi.mocked(prisma.energyBill.upsert).mockResolvedValue({
      id: 'bill-1',
      clientId: 'test-client',
      plantId: 'test-plant',
      consumerUnitId: 'test-uc',
      referenceMonth: 6,
      referenceYear: 2026,
      status: 'draft',
    } as any);

    // -----------------------------------------------------------------------
    // Act
    // -----------------------------------------------------------------------
    const response = await POST(mockUploadRequest());
    const body = await response.json();

    // -----------------------------------------------------------------------
    // Assert
    // -----------------------------------------------------------------------
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);

    // 1. analyzer.extract called with buffer + mimeType
    expect(mockAnalyzer.extract).toHaveBeenCalledTimes(1);
    expect(mockAnalyzer.extract).toHaveBeenCalledWith({
      buffer: expect.any(Buffer),
      mimeType: 'application/pdf',
    });

    // 2. analyzer.analyze called with raw + flags
    expect(mockAnalyzer.analyze).toHaveBeenCalledTimes(1);
    expect(mockAnalyzer.analyze).toHaveBeenCalledWith({
      raw: mockExtractResult,
      flags: mockFlags,
    });

    // 3. mapRawToBillJson called with raw data
    expect(mapRawToBillJson).toHaveBeenCalledTimes(1);
    expect(mapRawToBillJson).toHaveBeenCalledWith(mockExtractResult);

    // 4. Bill upserted with merged analysis + mapping data
    expect(prisma.energyBill.upsert).toHaveBeenCalledTimes(1);
    const upsertCall = vi.mocked(prisma.energyBill.upsert).mock.calls[0][0];

    // aiAnalysis from analysis (non-null)
    expect(upsertCall.create.aiAnalysis).toBe(mockAnalyzeResult.aiAnalysis);
    // aiExplanations from analysis
    expect(upsertCall.create.aiExplanations).toEqual(mockAnalyzeResult.aiExplanations);
    // aiRecommendations from analysis
    expect(upsertCall.create.aiRecommendations).toEqual(mockAnalyzeResult.aiRecommendations);
    // alerts from analysis
    expect(upsertCall.create.alerts).toEqual(mockAnalyzeResult.alerts);
    // billScore from analysis
    expect(upsertCall.create.billScore).toBe(mockAnalyzeResult.billScore);
    // estimatedSavings from analysis
    expect(upsertCall.create.estimatedSavings).toBe(mockAnalyzeResult.estimatedSavings);

    // billingItems from jsonColumns (populated)
    expect(upsertCall.create.billingItems).toEqual(mockJsonColumns.billingItems);
    // creditSummary from jsonColumns
    expect(upsertCall.create.creditSummary).toEqual(mockJsonColumns.creditSummary);
    // extraCharges from jsonColumns
    expect(upsertCall.create.extraCharges).toEqual(mockJsonColumns.extraCharges);

    // status remains 'draft'
    expect(upsertCall.create.status).toBe('draft');

    // 5. BILL_UPLOADED event emitted
    expect(eventBus.emit).toHaveBeenCalledWith(EventType.BILL_UPLOADED, {
      billId: 'bill-1',
      clientId: 'test-client',
      consumerUnitId: 'test-uc',
    });
  });
});
