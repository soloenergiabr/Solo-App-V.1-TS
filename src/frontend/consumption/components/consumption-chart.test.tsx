import { it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

it('consumption chart uses tokens, not hardcoded hex', () => {
  const src = readFileSync(join(__dirname, 'consumption-chart.tsx'), 'utf8')
  expect(src).not.toContain('#22c55e')
  expect(src).not.toContain('#fff')
  expect(src).toContain('var(--chart-3)')
})
