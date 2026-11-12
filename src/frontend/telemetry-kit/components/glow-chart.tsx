"use client"

import { useId } from "react"
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import { cn } from "@/lib/utils"

type Row = Record<string, string | number>

export function GlowChart({
    data,
    dataKey,
    xKey,
    height = 300,
    className,
    valueFormatter,
    valueLabel,
    bars = false,
}: {
    data: Row[]
    dataKey: string
    xKey: string
    height?: number
    className?: string
    valueFormatter?: (value: number) => string
    valueLabel?: string
    /** Barras em vez de área (poucos pontos discretos, ex.: 7 dias da semana). */
    bars?: boolean
}) {
    const gradientId = useId()

    if (data.length === 0) {
        return (
            <div
                data-slot="glow-chart"
                className={cn(
                    "flex items-center justify-center rounded-2xl border bg-card text-sm text-muted-foreground",
                    className,
                )}
                style={{ height }}
            >
                Sem dados no período
            </div>
        )
    }

    // Eixos, gradiente e tooltip iguais nos dois tipos (array: o Recharts lê os filhos diretos).
    const common = [
        <defs key="defs">
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.6} />
                <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.05} />
            </linearGradient>
        </defs>,
        <XAxis key="x" dataKey={xKey} stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />,
        <YAxis key="y" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} width={36} />,
        <Tooltip
            key="tooltip"
            contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0.75rem",
                color: "var(--foreground)",
            }}
            formatter={(value: number) => [
                valueFormatter ? valueFormatter(value) : value,
                valueLabel ?? dataKey,
            ]}
        />,
    ]

    return (
        <div
            data-slot="glow-chart"
            data-testid="glow-chart"
            className={cn("rounded-2xl border bg-card p-2", className)}
            style={{ height }}
        >
            <ResponsiveContainer width="100%" height="100%">
                {bars ? (
                    <BarChart data={data}>
                        {common}
                        <Bar dataKey={dataKey} fill={`url(#${gradientId})`} stroke="var(--chart-1)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                ) : (
                    <AreaChart data={data}>
                        {common}
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke="var(--chart-1)"
                            strokeWidth={2}
                            fill={`url(#${gradientId})`}
                        />
                    </AreaChart>
                )}
            </ResponsiveContainer>
        </div>
    )
}
