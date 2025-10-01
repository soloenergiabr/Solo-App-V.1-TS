'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, TrendingUp, Activity, Database, ArrowUp, ArrowDown } from "lucide-react";
import { DashboardAnalytics } from "../../hooks/use-generation-dashboard";

interface OverviewCardsProps {
    analytics: DashboardAnalytics;
    isRealTime?: boolean;
}

export function OverviewCards({ analytics, isRealTime = false }: OverviewCardsProps) {
    const { overview, comparison } = analytics;

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(num);
    };

    const formatPercentage = (num: number) => {
        const formatted = Math.abs(num).toFixed(1);
        return num >= 0 ? `+${formatted}%` : `-${formatted}%`;
    };

    const cards = isRealTime ? [
        // Cards para Tempo Real (foco em potência)
        {
            title: "Potência Atual",
            value: `${formatNumber(overview.totalPower)} W`,
            icon: Activity,
            description: "Potência em tempo real",
            change: comparison?.percentageChange?.power,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Geração Hoje",
            value: `${formatNumber(overview.totalEnergy)} kWh`,
            icon: Zap,
            description: "Energia gerada hoje",
            change: comparison?.percentageChange?.energy,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50",
        },
        {
            title: "Pico de Potência",
            value: `${formatNumber(overview.peakPower)} W`,
            icon: TrendingUp,
            description: overview.peakPowerTimestamp 
                ? `Às ${new Date(overview.peakPowerTimestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                : "Pico do dia",
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Inversores Ativos",
            value: `${overview.activeInverters}/${overview.totalInverters}`,
            icon: Database,
            description: "Gerando agora",
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
    ] : [
        // Cards para Histórico (foco em energia)
        {
            title: "Energia Total",
            value: `${formatNumber(overview.totalEnergy)} kWh`,
            icon: Zap,
            description: "Energia gerada no período",
            change: comparison?.percentageChange?.energy,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50",
        },
        {
            title: "Potência Média",
            value: `${formatNumber(overview.averagePower)} W`,
            icon: Activity,
            description: "Média do período",
            change: comparison?.percentageChange?.power,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Pico de Potência",
            value: `${formatNumber(overview.peakPower)} W`,
            icon: TrendingUp,
            description: overview.peakPowerTimestamp 
                ? `Em ${new Date(overview.peakPowerTimestamp).toLocaleDateString('pt-BR')}`
                : "Pico registrado",
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Pontos de Dados",
            value: `${overview.totalDataPoints}`,
            icon: Database,
            description: `${overview.activeInverters} inversores`,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, index) => {
                const Icon = card.icon;
                const hasPositiveChange = card.change !== undefined && card.change >= 0;
                
                return (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {card.title}
                            </CardTitle>
                            <div className={`${card.bgColor} p-2 rounded-lg`}>
                                <Icon className={`h-4 w-4 ${card.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                            <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-muted-foreground">
                                    {card.description}
                                </p>
                                {card.change !== undefined && (
                                    <div className={`flex items-center text-xs font-medium ${
                                        hasPositiveChange ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {hasPositiveChange ? (
                                            <ArrowUp className="h-3 w-3 mr-1" />
                                        ) : (
                                            <ArrowDown className="h-3 w-3 mr-1" />
                                        )}
                                        {formatPercentage(card.change)}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
