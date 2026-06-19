'use client'

import { cn } from '@/lib/utils'

const SIZE = { sm: 80, md: 120, lg: 160 } as const
const STROKE = { sm: 6, md: 8, lg: 10 } as const

function scoreColor(score: number): string {
    if (score <= 40) return 'stroke-destructive text-destructive'
    if (score <= 70) return 'stroke-warning text-warning'
    return 'stroke-success text-success'
}

function scoreColorHex(score: number): string {
    if (score <= 40) return '#ef4444' // destructive
    if (score <= 70) return '#eab308' // warning
    return '#22c55e' // success
}

export function BillScoreRing({
    score,
    size = 'md',
}: {
    score: number | null
    size?: 'sm' | 'md' | 'lg'
}) {
    const dim = SIZE[size]
    const sw = STROKE[size]
    const radius = (dim - sw) / 2
    const circumference = 2 * Math.PI * radius
    const center = dim / 2

    if (score == null) {
        return (
            <svg
                width={dim}
                height={dim}
                viewBox={`0 0 ${dim} ${dim}`}
                className="shrink-0"
                role="img"
                aria-label="Pontuacao indisponivel"
            >
                {/* Dashed background ring */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={sw}
                    strokeDasharray="4 4"
                    className="text-muted-foreground/30"
                />
                <text
                    x={center}
                    y={center}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-muted-foreground text-xl font-semibold"
                >
                    —
                </text>
            </svg>
        )
    }

    const clamped = Math.min(100, Math.max(0, score))
    const offset = circumference - (clamped / 100) * circumference
    const colorClass = scoreColor(clamped)
    const hexColor = scoreColorHex(clamped)

    return (
        <svg
            width={dim}
            height={dim}
            viewBox={`0 0 ${dim} ${dim}`}
            className="shrink-0"
            role="img"
            aria-label={`Pontuacao: ${clamped}`}
        >
            {/* Background track */}
            <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={sw}
                className="text-muted/30"
            />
            {/* Foreground arc */}
            <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={hexColor}
                strokeWidth={sw}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform={`rotate(-90 ${center} ${center})`}
                className="transition-all duration-700 ease-out"
            />
            <text
                x={center}
                y={center}
                textAnchor="middle"
                dominantBaseline="central"
                className={cn('text-xl font-bold', colorClass)}
            >
                {clamped}
            </text>
        </svg>
    )
}
