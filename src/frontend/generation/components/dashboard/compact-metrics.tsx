'use client';

import { Zap, TrendingUp, Activity, Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
            value: formatNumber(overview.totalPower),
            unit: "W",
            icon: Activity,
            gradient: "from-blue-500/10 via-blue-500/5 to-background",
            borderColor: "border-blue-500/20",
            iconColor: "text-blue-500",
            valueColor: "text-blue-600 dark:text-blue-400",
        },
        {
            label: "Geração Hoje",
            value: formatNumber(overview.totalEnergy),
            unit: "kWh",
            icon: Zap,
            gradient: "from-yellow-500/10 via-yellow-500/5 to-background",
            borderColor: "border-yellow-500/20",
            iconColor: "text-yellow-500",
            valueColor: "text-yellow-600 dark:text-yellow-400",
        },
        {
            label: "Pico de Potência",
            value: formatNumber(overview.peakPower),
            unit: "W",
            icon: TrendingUp,
            gradient: "from-green-500/10 via-green-500/5 to-background",
            borderColor: "border-green-500/20",
            iconColor: "text-green-500",
            valueColor: "text-green-600 dark:text-green-400",
        },
        {
            label: "Inversores Ativos",
            value: `${overview.activeInverters}`,
            unit: `/ ${overview.totalInverters}`,
            icon: Database,
            gradient: "from-purple-500/10 via-purple-500/5 to-background",
            borderColor: "border-purple-500/20",
            iconColor: "text-purple-500",
            valueColor: "text-purple-600 dark:text-purple-400",
        },
    ] : [
        {
            label: "Energia Total",
            value: formatNumber(overview.totalEnergy),
            unit: "kWh",
            icon: Zap,
            gradient: "from-yellow-500/10 via-yellow-500/5 to-background",
            borderColor: "border-yellow-500/20",
            iconColor: "text-yellow-500",
            valueColor: "text-yellow-600 dark:text-yellow-400",
        },
        {
            label: "Potência Média",
            value: formatNumber(overview.averagePower),
            unit: "W",
            icon: Activity,
            gradient: "from-blue-500/10 via-blue-500/5 to-background",
            borderColor: "border-blue-500/20",
            iconColor: "text-blue-500",
            valueColor: "text-blue-600 dark:text-blue-400",
        },
        {
            label: "Pico de Potência",
            value: formatNumber(overview.peakPower),
            unit: "W",
            icon: TrendingUp,
            gradient: "from-green-500/10 via-green-500/5 to-background",
            borderColor: "border-green-500/20",
            iconColor: "text-green-500",
            valueColor: "text-green-600 dark:text-green-400",
        },
        {
            label: "Pontos de Dados",
            value: `${overview.totalDataPoints}`,
            unit: "",
            icon: Database,
            gradient: "from-purple-500/10 via-purple-500/5 to-background",
            borderColor: "border-purple-500/20",
            iconColor: "text-purple-500",
            valueColor: "text-purple-600 dark:text-purple-400",
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => {
                const Icon = metric.icon;

                return (
                    <Card
                        key={index}
                        className={`bg-gradient-to-br ${metric.gradient} ${metric.borderColor}`}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon className={`h-5 w-5 ${metric.iconColor}`} />
                                <span className="text-sm text-muted-foreground font-medium">
                                    {metric.label}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-3xl font-bold ${metric.valueColor}`}>
                                    {metric.value}
                                </span>
                                {metric.unit && (
                                    <span className="text-sm text-muted-foreground">
                                        {metric.unit}
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
