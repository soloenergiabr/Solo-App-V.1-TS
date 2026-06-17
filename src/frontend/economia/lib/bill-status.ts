import type { BillPaymentStatus } from '@/shared/controle/types'

export function resolveBillStatus(
    bill: { paymentStatus: BillPaymentStatus; paidAt: string | null; dueDate: string | null },
    now: Date = new Date(),
): BillPaymentStatus {
    if (bill.paidAt || bill.paymentStatus === 'paga') return 'paga'
    if (bill.dueDate && new Date(bill.dueDate) < now) return 'vencida'
    return 'a_pagar'
}

export function statusToBadge(status: BillPaymentStatus): { label: string; tone: 'success' | 'warning' | 'destructive' } {
    switch (status) {
        case 'paga':
            return { label: 'paga', tone: 'success' }
        case 'vencida':
            return { label: 'vencida', tone: 'destructive' }
        default:
            return { label: 'a pagar', tone: 'warning' }
    }
}
