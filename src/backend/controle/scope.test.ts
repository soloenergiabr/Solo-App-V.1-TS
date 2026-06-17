import { describe, expect, it } from 'vitest'
import { computeAccessibleUnitIds } from './scope'

describe('computeAccessibleUnitIds', () => {
    it("returns 'all' when the user pays no specific units (titular/admin)", () => {
        expect(computeAccessibleUnitIds([])).toBe('all')
    })

    it('returns the payer unit ids when the user is scoped to units', () => {
        expect(computeAccessibleUnitIds(['u1', 'u2'])).toEqual(['u1', 'u2'])
    })

    it('returns a single-element list for a payer of one unit', () => {
        expect(computeAccessibleUnitIds(['u9'])).toEqual(['u9'])
    })
})
