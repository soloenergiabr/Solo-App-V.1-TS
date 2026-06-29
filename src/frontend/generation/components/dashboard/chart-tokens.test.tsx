import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const files = [
  'time-series-chart.tsx',
  'type-distribution-chart.tsx',
  'inverters-comparison-chart.tsx',
  'adaptive-chart.tsx',
]

describe('generation charts use valid design tokens', () => {
  for (const f of files) {
    it(`${f} has no double-wrapped hsl(var()) or stray hex`, () => {
      const src = readFileSync(join(__dirname, f), 'utf8')
      expect(src).not.toMatch(/hsl\(var\(/)
      expect(src).not.toContain('#8884d8')
      expect(src).not.toContain('#fff')
    })
  }
})
