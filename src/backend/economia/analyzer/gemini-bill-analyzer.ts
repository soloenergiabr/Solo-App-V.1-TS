import { GoogleGenerativeAI } from '@google/generative-ai'
import { cleanJsonText } from './parsers'
import {
  AnalyzerError,
  BillAnalyzer,
  DeterministicBillFlags,
  RawBillData,
  SpecialistAnalysis,
} from './types'

/* ------------------------------------------------------------------ */
/*  Extraction prompt (same as current import route)                    */
/* ------------------------------------------------------------------ */

const EXTRACTION_PROMPT = `
Você é um especialista em faturas brasileiras de energia elétrica e geração distribuída.
Extraia os campos abaixo da fatura enviada e retorne APENAS JSON válido, sem markdown.
Use null quando não encontrar um campo. Use números sem símbolo de moeda. Datas em ISO yyyy-mm-dd.

{
  "referenceMonth": number,
  "referenceYear": number,
  "competenceDate": "yyyy-mm-dd",
  "accountHolder": string | null,
  "accountNumber": string | null,
  "clientNumber": string | null,
  "instalationNumber": string | null,
  "distributor": string | null,
  "consumerClass": string | null,
  "tariffModality": string | null,
  "connectionType": string | null,
  "tariffPeriod": string | null,
  "billingDays": number | null,
  "readingPeriodFrom": "yyyy-mm-dd" | null,
  "readingPeriodTo": "yyyy-mm-dd" | null,
  "creditExpiryDate": "yyyy-mm-dd" | null,
  "monitoredGenerationKwh": number | null,
  "billedConsumptionKwh": number | null,
  "consumptionKwh": number | null,
  "realConsumptionKwh": number | null,
  "injectedEnergyKwh": number | null,
  "compensatedEnergyKwh": number | null,
  "previousCreditsKwh": number | null,
  "currentCreditsKwh": number | null,
  "expectedGenerationKwh": number | null,
  "generationEfficiency": number | null,
  "meterReadingCurrent": number | null,
  "meterReadingPrevious": number | null,
  "demandContractedKw": number | null,
  "demandMeasuredKw": number | null,
  "totalBillValue": number | null,
  "totalAmount": number | null,
  "energyCost": number | null,
  "availabilityCost": number | null,
  "publicLightingCost": number | null,
  "icmsCost": number | null,
  "pisCost": number | null,
  "cofinsCost": number | null,
  "pisCofinsCost": number | null,
  "tariffPerKwh": number | null,
  "tariffTeValue": number | null,
  "tariffTusdValue": number | null,
  "tariffFlag": string | null,
  "tariffFlagCost": number | null,
  "sectoralCharges": number | null,
  "fineAmount": number | null,
  "interestAmount": number | null,
  "otherCharges": number | null,
  "estimatedSavings": number | null,
  "billingItems": [],
  "creditSummary": {},
  "extraCharges": [],
  "alerts": [],
  "aiAnalysis": string | null,
  "aiExplanations": {},
  "aiRecommendations": [],
  "billScore": number | null
}
`

/* ------------------------------------------------------------------ */
/*  Analysis prompt (Brazilian Portuguese specialist)                   */
/* ------------------------------------------------------------------ */

function buildAnalysisPrompt(
  raw: RawBillData,
  flags: DeterministicBillFlags,
): string {
  return `
Você é um professor especialista em contas de energia elétrica e geração distribuída no Brasil.
Com base nos dados extraídos abaixo, realize uma análise completa.

## Dados brutos da fatura
${JSON.stringify(raw, null, 2)}

## Bandeiras determinísticas (calculadas matematicamente)
${JSON.stringify(flags, null, 2)}

Com base nessas informações, produza APENAS JSON válido, sem markdown, com a seguinte estrutura:

{
  "aiAnalysis": string | null (resumo executivo em português, 3-5 frases),
  "aiExplanations": {} (objeto com explicações detalhadas para cada item relevante),
  "aiRecommendations": [] (lista de recomendações em português),
  "alerts": [] (lista de alertas sobre a fatura, ex: vencimento próximo, consumo acima do esperado),
  "billingItems": [] (lista dos itens que compõem a fatura),
  "creditSummary": {} (resumo dos créditos de energia),
  "extraCharges": [] (lista de cobranças adicionais encontradas),
  "billScore": number | null (nota de 0 a 100 baseada na sua análise),
  "estimatedSavings": number | null (economia estimada em reais)
}
`
}

/* ------------------------------------------------------------------ */
/*  Factory & implementation                                            */
/* ------------------------------------------------------------------ */

export function createGeminiBillAnalyzer(): BillAnalyzer {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new AnalyzerError(
      'GEMINI_API_KEY environment variable is not set',
    )
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  return {
    async extract({ buffer, mimeType }) {
      const result = await model.generateContent([
        EXTRACTION_PROMPT,
        {
          inlineData: {
            data: buffer.toString('base64'),
            mimeType,
          },
        },
      ])

      const text = result.response.text()

      try {
        const parsed = JSON.parse(cleanJsonText(text))
        return parsed as RawBillData
      } catch (err) {
        throw new AnalyzerError(
          'Failed to parse Gemini extraction response as JSON',
          err,
        )
      }
    },

    async analyze({ raw, flags }) {
      const prompt = buildAnalysisPrompt(raw, flags)
      const result = await model.generateContent([prompt])

      const text = result.response.text()

      try {
        const parsed = JSON.parse(cleanJsonText(text))
        return parsed as SpecialistAnalysis
      } catch (err) {
        throw new AnalyzerError(
          'Failed to parse Gemini analysis response as JSON',
          err,
        )
      }
    },
  }
}
