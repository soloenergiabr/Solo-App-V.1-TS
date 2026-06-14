export function calcPaybackPercent(input: { totalInvested: number; returned: number }): number {
    if (input.totalInvested <= 0) return 0
    const pct = (input.returned / input.totalInvested) * 100
    return Math.max(0, Math.min(100, Math.round(pct)))
}

export function calcSavings(input: { wouldPay: number; actuallyPay: number }): {
    amount: number
    percent: number
} {
    const amount = Math.max(0, input.wouldPay - input.actuallyPay)
    const percent = input.wouldPay > 0 ? Math.round((amount / input.wouldPay) * 100) : 0
    return { amount, percent }
}
