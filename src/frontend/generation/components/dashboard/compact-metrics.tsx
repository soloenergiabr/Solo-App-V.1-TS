'use client';

import { Zap, TrendingUp, Activity, Database } from "lucide-react";
import { DashboardAnalytics } from "../../hooks/use-generation-dashboard";

interface CompactMetricsProps {
    analytics: DashboardAnalytics;
    isRealTime?: boolean;
}

export function CompactMetrics({ analytics, isRealTime = false }: CompactMetricsProps) {
    const { overview } = analytics;

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(num);
    };

    const metrics = isRealTime ? [
        {
            label: "Potência Atual",
            value: `${formatNumber(overview.totalPower)} W`,
            icon: Activity,
            color: "text-blue-500",
        },
        {
            label: "Geração Hoje",
            value: `${formatNumber(overview.totalEnergy)} kWh`,
            icon: Zap,
            color: "text-yellow-500",
        },
        {
            label: "Pico de Potência",
            value: `${formatNumber(overview.peakPower)} W`,
            icon: TrendingUp,
            color: "text-green-500",
        },
        {
            label: "Inversores Ativos",
            value: `${overview.activeInverters}/${overview.totalInverters}`,
            icon: Database,
            color: "text-purple-500",
        },
    ] : [
        {
            label: "Energia Total",
            value: `${formatNumber(overview.totalEnergy)} kWh`,
            icon: Zap,
            color: "text-yellow-500",
        },
        {
            label: "Potência Média",
            value: `${formatNumber(overview.averagePower)} W`,
            icon: Activity,
            color: "text-blue-500",
        },
        {
            label: "Pico de Potência",
            value: `${formatNumber(overview.peakPower)} W`,
            icon: TrendingUp,
            color: "text-green-500",
        },
        {
            label: "Pontos de Dados",
            value: `${overview.totalDataPoints}`,
            icon: Database,
            color: "text-purple-500",
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-3">
            {metrics.map((metric, index) => {
                const Icon = metric.icon;

                return (
                    <div key={index} className="flex flex-col items-center justify-center p-4 rounded-lg">
                        <Icon className={`h-5 w-5 mb-2 ${metric.color}`} />
                        <div className="text-2xl font-bold text-center">{metric.value}</div>
                        <div className="text-xs text-muted-foreground text-center mt-1">
                            {metric.label}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
