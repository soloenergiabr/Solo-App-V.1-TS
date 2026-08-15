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

    // A payer user is marked by role, not by "happens to have units". Without
    // this, unassigning a payer's last unit would silently promote them to
    // titular and expose the whole client's bills.
    it('returns an empty scope for a role-marked payer with no units', () => {
        expect(computeAccessibleUnitIds([], true)).toEqual([])
    })

    it('keeps a role-marked payer restricted to their units', () => {
        expect(computeAccessibleUnitIds(['u1'], true)).toEqual(['u1'])
    })

    it("still returns 'all' for a titular that pays no units", () => {
        expect(computeAccessibleUnitIds([], false)).toBe('all')
    })
})
