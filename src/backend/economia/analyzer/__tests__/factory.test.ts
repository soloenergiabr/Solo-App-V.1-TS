import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/* ------------------------------------------------------------------ */
/*  Mock all three provider SDKs so no network / real keys are needed  */
/* ------------------------------------------------------------------ */

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn(),
      stream: vi.fn(),
    },
  })),
}))

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn(),
    }),
  })),
}))

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}))

import { getBillAnalyzer } from '../factory'

/* ------------------------------------------------------------------ */
/*  Preserve and restore process.env between cases                     */
/* ------------------------------------------------------------------ */

const ORIGINAL_ENV = { ...process.env }

beforeEach(() => {
  vi.clearAllMocks()
  // Provide keys so any eager construction does not throw, but the
  // factory itself must not require them (lazy clients).
  process.env.GEMINI_API_KEY = 'test-gemini-key'
  process.env.ANTHROPIC_API_KEY = 'test-anthropic-key'
  process.env.OPENAI_API_KEY = 'test-openai-key'
})

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
})

/* ------------------------------------------------------------------ */
/*  getBillAnalyzer() — provider selection                             */
/* ------------------------------------------------------------------ */

describe('getBillAnalyzer', () => {
  it('defaults to the claude provider when no env is set', () => {
    delete process.env.BILL_ANALYZER_PROVIDER
    const provider = getBillAnalyzer()
    expect(provider.name).toBe('claude')
  })

  it('selects the gemini provider when BILL_ANALYZER_PROVIDER=gemini', () => {
    process.env.BILL_ANALYZER_PROVIDER = 'gemini'
    const provider = getBillAnalyzer()
    expect(provider.name).toBe('gemini')
  })

  it('selects the openai provider when BILL_ANALYZER_PROVIDER=openai', () => {
    process.env.BILL_ANALYZER_PROVIDER = 'openai'
    const provider = getBillAnalyzer()
    expect(provider.name).toBe('openai')
  })

  it('falls back to claude for an unknown provider value', () => {
    process.env.BILL_ANALYZER_PROVIDER = 'totally-unknown'
    const provider = getBillAnalyzer()
    expect(provider.name).toBe('claude')
  })

  it('is case-insensitive on the provider value', () => {
    process.env.BILL_ANALYZER_PROVIDER = 'GEMINI'
    const provider = getBillAnalyzer()
    expect(provider.name).toBe('gemini')
  })

  it('does not require a live API key just to select a provider', () => {
    delete process.env.ANTHROPIC_API_KEY
    delete process.env.OPENAI_API_KEY
    delete process.env.BILL_ANALYZER_PROVIDER
    expect(() => getBillAnalyzer()).not.toThrow()
  })

  it.each(['claude', 'gemini', 'openai'] as const)(
    'returns a provider exposing extract/analyze/chat and name for %s',
    (name) => {
      process.env.BILL_ANALYZER_PROVIDER = name
      const provider = getBillAnalyzer()
      expect(provider.name).toBe(name)
      expect(typeof provider.extract).toBe('function')
      expect(typeof provider.analyze).toBe('function')
      expect(typeof provider.chat).toBe('function')
    },
  )
})
