import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createGeminiBillAnalyzer } from './gemini-bill-analyzer'
import { AnalyzerError, RawBillData } from './types'

/* ------------------------------------------------------------------ */
/*  Mock @google/generative-ai                                          */
/* ------------------------------------------------------------------ */

const mockGenerateContent = vi.fn()

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: mockGenerateContent,
    }),
  })),
}))

/* ------------------------------------------------------------------ */
/*  Fixtures                                                            */
/* ------------------------------------------------------------------ */

const VALID_RAW_RESPONSE: RawBillData = {
  referenceMonth: 6,
  referenceYear: 2026,
  competenceDate: '2026-06-10',
  accountHolder: 'João Silva',
  accountNumber: '123456',
  clientNumber: '789012',
  instalationNumber: '345678',
  distributor: 'Enel',
  consumerClass: 'Residencial',
  tariffModality: 'Branca',
  connectionType: 'monofasico',
  tariffPeriod: 'Posto',
  billingDays: 30,
  readingPeriodFrom: '2026-05-10',
  readingPeriodTo: '2026-06-10',
  creditExpiryDate: '2026-07-10',
  monitoredGenerationKwh: 200,
  billedConsumptionKwh: 150,
  consumptionKwh: 180,
  realConsumptionKwh: 180,
  injectedEnergyKwh: 120,
  compensatedEnergyKwh: 80,
  previousCreditsKwh: 10,
  currentCreditsKwh: 15,
  expectedGenerationKwh: 190,
  generationEfficiency: 0.95,
  meterReadingCurrent: 1234,
  meterReadingPrevious: 1000,
  demandContractedKw: 5,
  demandMeasuredKw: 4.5,
  totalBillValue: 150.75,
  totalAmount: 150.75,
  energyCost: 100.0,
  availabilityCost: 20.0,
  publicLightingCost: 15.0,
  icmsCost: 25.0,
  pisCost: 5.0,
  cofinsCost: 10.0,
  pisCofinsCost: 15.0,
  tariffPerKwh: 0.85,
  tariffTeValue: 0.45,
  tariffTusdValue: 0.40,
  tariffFlag: 'Verde',
  tariffFlagCost: 0,
  sectoralCharges: 3.0,
  fineAmount: null,
  interestAmount: null,
  otherCharges: null,
  estimatedSavings: 50.0,
  billingItems: [],
  creditSummary: {},
  extraCharges: [],
  alerts: [],
  aiAnalysis: null,
  aiExplanations: {},
  aiRecommendations: [],
  billScore: null,
}

const BUFFER = Buffer.from('fake-pdf-content')
const MIME_TYPE = 'application/pdf'

/* ------------------------------------------------------------------ */
/*  Setup                                                               */
/* ------------------------------------------------------------------ */

beforeEach(() => {
  vi.clearAllMocks()
  process.env.GEMINI_API_KEY = 'test-key'
})

/* ------------------------------------------------------------------ */
/*  extract()                                                           */
/* ------------------------------------------------------------------ */

describe('createGeminiBillAnalyzer().extract', () => {
  it('returns RawBillData on successful extraction', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => JSON.stringify(VALID_RAW_RESPONSE),
      },
    })

    const analyzer = createGeminiBillAnalyzer()
    const result = await analyzer.extract({ buffer: BUFFER, mimeType: MIME_TYPE })

    expect(result.referenceMonth).toBe(6)
    expect(result.referenceYear).toBe(2026)
    expect(result.accountHolder).toBe('João Silva')
    expect(result.distributor).toBe('Enel')
    expect(result.connectionType).toBe('monofasico')
  })

  it('handles markdown-fenced JSON', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => '```json\n' + JSON.stringify(VALID_RAW_RESPONSE) + '\n```',
      },
    })

    const analyzer = createGeminiBillAnalyzer()
    const result = await analyzer.extract({ buffer: BUFFER, mimeType: MIME_TYPE })

    expect(result.referenceMonth).toBe(6)
  })

  it('throws AnalyzerError when JSON is invalid', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => 'This is not JSON',
      },
    })

    const analyzer = createGeminiBillAnalyzer()

    await expect(
      analyzer.extract({ buffer: BUFFER, mimeType: MIME_TYPE }),
    ).rejects.toThrow(AnalyzerError)
  })

  it('throws AnalyzerError when JSON is truncated', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => '{"referenceMonth": 6, ',
      },
    })

    const analyzer = createGeminiBillAnalyzer()

    await expect(
      analyzer.extract({ buffer: BUFFER, mimeType: MIME_TYPE }),
    ).rejects.toThrow(AnalyzerError)
  })
})

/* ------------------------------------------------------------------ */
/*  analyze()                                                           */
/* ------------------------------------------------------------------ */

describe('createGeminiBillAnalyzer().analyze', () => {
  it('returns SpecialistAnalysis on successful analysis', async () => {
    const analysisResponse = {
      aiAnalysis: 'Fatura dentro do esperado para o mês.',
      aiExplanations: { energyCost: 'Custo de energia dentro da média' },
      aiRecommendations: ['Considere reduzir consumo no horário de ponta'],
      alerts: ['Vencimento próximo'],
      billingItems: [{ name: 'Consumo', value: 180 }],
      creditSummary: { totalCredits: 80 },
      extraCharges: [],
      billScore: 85,
      estimatedSavings: 50,
    }

    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => JSON.stringify(analysisResponse),
      },
    })

    const analyzer = createGeminiBillAnalyzer()
    const result = await analyzer.analyze({
      raw: VALID_RAW_RESPONSE,
      flags: {
        minimumKwh: 30,
        solarCoveredMinimum: true,
        extraChargesTotal: 15,
        estimatedSavings: 50,
        billScore: 85,
        connectionType: 'monofasico',
      },
    })

    expect(result.aiAnalysis).toBe('Fatura dentro do esperado para o mês.')
    expect(result.aiRecommendations).toHaveLength(1)
    expect(result.billScore).toBe(85)
    expect(result.estimatedSavings).toBe(50)
  })

  it('throws AnalyzerError on invalid JSON from analysis', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => 'broken json{{{',
      },
    })

    const analyzer = createGeminiBillAnalyzer()

    await expect(
      analyzer.analyze({
        raw: VALID_RAW_RESPONSE,
        flags: {
          minimumKwh: 30,
          solarCoveredMinimum: true,
          extraChargesTotal: 0,
          estimatedSavings: null,
          billScore: 100,
          connectionType: null,
        },
      }),
    ).rejects.toThrow(AnalyzerError)
  })
})

/* ------------------------------------------------------------------ */
/*  Factory                                                             */
/* ------------------------------------------------------------------ */

describe('createGeminiBillAnalyzer', () => {
  it('throws AnalyzerError when GEMINI_API_KEY is not set', () => {
    delete process.env.GEMINI_API_KEY
    expect(() => createGeminiBillAnalyzer()).toThrow(AnalyzerError)
    expect(() => createGeminiBillAnalyzer()).toThrow(
      'GEMINI_API_KEY environment variable is not set',
    )
  })
})
