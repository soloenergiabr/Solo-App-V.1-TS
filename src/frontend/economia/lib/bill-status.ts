import type { BillPaymentStatus } from '@/shared/controle/types'

export function resolveBillStatus(
    bill: { paymentStatus: BillPaymentStatus; paidAt: string | null; dueDate: string | null },
    now: Date = new Date(),
): BillPaymentStatus {
    if (bill.paidAt || bill.paymentStatus === 'paga') return 'paga'
    // Vence no fim do dia: compara so a data (vencimento e data pura em UTC; hoje no fuso local).
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    if (bill.dueDate && bill.dueDate.slice(0, 10) < today) return 'vencida'
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
