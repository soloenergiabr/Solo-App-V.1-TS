import { createClaudeBillAnalyzer } from './claude-bill-analyzer'
import { createGeminiBillAnalyzer } from './gemini-bill-analyzer'
import { createOpenAIBillAnalyzer } from './openai-bill-analyzer'
import { BillAnalyzerProvider } from './types'

/* ------------------------------------------------------------------ */
/*  Provider factory — switched by BILL_ANALYZER_PROVIDER               */
/* ------------------------------------------------------------------ */

export function getBillAnalyzer(): BillAnalyzerProvider {
  const provider = (process.env.BILL_ANALYZER_PROVIDER ?? 'claude').toLowerCase()
  switch (provider) {
    case 'gemini':
      return createGeminiBillAnalyzer()
    case 'openai':
      return createOpenAIBillAnalyzer()
    case 'claude':
    default:
      return createClaudeBillAnalyzer()
  }
}
