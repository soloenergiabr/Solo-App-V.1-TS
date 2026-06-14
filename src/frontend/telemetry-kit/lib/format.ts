const BRL_WHOLE = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
})

const BRL_CENTS = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

function normalize(value: string): string {
    return value.replace(/\u00a0/g, ' ')
}

export function formatBRL(value: number, opts: { cents?: boolean } = {}): string {
    const fmt = opts.cents ? BRL_CENTS : BRL_WHOLE
    return normalize(fmt.format(value))
}

function decimalFmt(maxDecimals: number): Intl.NumberFormat {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: maxDecimals,
    })
}

export function formatKwh(value: number): string {
    return `${decimalFmt(1).format(value)} kWh`
}

export function formatKw(value: number): string {
    return `${decimalFmt(1).format(value)} kW`
}

export function formatPercent(value: number, opts: { decimals?: number } = {}): string {
    return `${decimalFmt(opts.decimals ?? 0).format(value)}%`
}
