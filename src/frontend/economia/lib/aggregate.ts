import type { AccountBill, EconomyConsolidated } from '@/shared/controle/types'

export function aggregateEconomy(bills: AccountBill[], creditsKwh = 0): EconomyConsolidated {
    const actuallyPay = bills.reduce((s, b) => s + b.amountDue, 0)
    const savedAmount = bills.reduce((s, b) => s + b.estimatedSavings, 0)
    const wouldPay = actuallyPay + savedAmount
    const savedPercent = wouldPay > 0 ? Math.round((savedAmount / wouldPay) * 100) : 0
    return { wouldPay, actuallyPay, savedAmount, savedPercent, creditsKwh }
}
