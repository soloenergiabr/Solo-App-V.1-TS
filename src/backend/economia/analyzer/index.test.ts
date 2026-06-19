import { describe, it, expect } from 'vitest'
import {
  createGeminiBillAnalyzer,
  computeDeterministicFlags,
  AnalyzerError,
} from './index'
import type { BillAnalyzer, RawBillData, DeterministicBillFlags, SpecialistAnalysis } from './index'

describe('public API', () => {
  it('exports createGeminiBillAnalyzer as a function', () => {
    expect(typeof createGeminiBillAnalyzer).toBe('function')
  })

  it('exports computeDeterministicFlags as a function', () => {
    expect(typeof computeDeterministicFlags).toBe('function')
  })

  it('exports AnalyzerError class', () => {
    const err = new AnalyzerError('test')
    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe('AnalyzerError')
  })

  it('exports types (compile-time check)', () => {
    // Type checks — these just verify the types are importable
    const _analyzer: BillAnalyzer | null = null
    const _raw: RawBillData | null = null
    const _flags: DeterministicBillFlags | null = null
    const _analysis: SpecialistAnalysis | null = null
    expect(true).toBe(true) // if it compiles, it passes
  })

  it('createGeminiBillAnalyzer requires GEMINI_API_KEY', () => {
    // Save previous and delete for this test
    const prev = process.env.GEMINI_API_KEY
    delete process.env.GEMINI_API_KEY
    expect(() => createGeminiBillAnalyzer()).toThrow(AnalyzerError)
    // Restore
    process.env.GEMINI_API_KEY = prev
  })
})
