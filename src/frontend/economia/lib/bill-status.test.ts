import { describe, it, expect } from 'vitest'
import { resolveBillStatus, statusToBadge } from './bill-status'

describe('resolveBillStatus', () => {
    const ref = new Date('2026-04-15T00:00:00Z')
    it('returns paga when paidAt is set', () => {
        expect(resolveBillStatus({ paymentStatus: 'a_pagar', paidAt: '2026-04-03', dueDate: '2026-04-12' }, ref)).toBe('paga')
    })
    it('returns vencida when unpaid and past due', () => {
        expect(resolveBillStatus({ paymentStatus: 'a_pagar', paidAt: null, dueDate: '2026-03-28' }, ref)).toBe('vencida')
    })
    it('returns a_pagar when unpaid and not yet due', () => {
        expect(resolveBillStatus({ paymentStatus: 'a_pagar', paidAt: null, dueDate: '2026-04-20' }, ref)).toBe('a_pagar')
    })
    it('returns a_pagar when no due date and unpaid', () => {
        expect(resolveBillStatus({ paymentStatus: 'a_pagar', paidAt: null, dueDate: null }, ref)).toBe('a_pagar')
    })
})

describe('statusToBadge', () => {
    it('maps each status to a label + tone', () => {
        expect(statusToBadge('paga')).toEqual({ label: 'paga', tone: 'success' })
        expect(statusToBadge('a_pagar')).toEqual({ label: 'a pagar', tone: 'warning' })
        expect(statusToBadge('vencida')).toEqual({ label: 'vencida', tone: 'destructive' })
    })
})
