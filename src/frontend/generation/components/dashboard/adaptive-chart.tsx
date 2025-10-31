'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardAnalytics, DashboardFilters } from "../../hooks/use-generation-dashboard";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AdaptiveChartProps {
    analytics: DashboardAnalytics;
    viewType: DashboardFilters['generationUnitType'];
}

export function AdaptiveChart({ analytics, viewType }: AdaptiveChartProps) {
    const { timeSeries } = analytics;

    // Formatar dados baseado no tipo de visualização
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);

        if (viewType === 'real_time' || viewType === 'day') {
            // Mostrar hora:minuto
            return format(date, 'HH:mm', { locale: ptBR });
        } else if (viewType === 'month') {
            // Mostrar dia do mês
            return format(date, 'dd/MM', { locale: ptBR });
        } else {
            // year: Mostrar mês
            return format(date, 'MMM', { locale: ptBR });
        }
    };

    const chartData = timeSeries.map(point => ({
        timestamp: formatTimestamp(point.timestamp),
        fullTimestamp: point.timestamp,
        energia: point.energy,
        potencia: point.power,
        inversores: point.inverterCount,
    }));

    const getTitle = () => {
        if (viewType === 'real_time') return 'Geração em Tempo Real';
        if (viewType === 'day') return 'Geração do Dia';
        if (viewType === 'month') return 'Geração do Mês';
        return 'Geração do Ano';
    };

    const getDescription = () => {
        if (viewType === 'real_time' || viewType === 'day') {
            return 'Evolução hora a hora da geração de energia';
        } else if (viewType === 'month') {
            return 'Geração diária do mês';
        }
        return 'Geração mensal do ano';
    };

    // Para real_time e day: Line Chart
    // Para month e year: Bar Chart
    const useBarChart = viewType === 'month' || viewType === 'year';

    return (
        <>
            <CardHeader>
                <CardTitle>{getTitle()}</CardTitle>
                <CardDescription>{getDescription()}</CardDescription>
            </CardHeader>
            {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                    Nenhum dado disponível para o período selecionado
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={400}>
                    {useBarChart ? (
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="timestamp"
                                className="text-xs"
                                angle={viewType === 'month' ? -45 : 0}
                                textAnchor={viewType === 'month' ? 'end' : 'middle'}
                                height={viewType === 'month' ? 80 : 50}
                            />
                            <YAxis
                                yAxisId="left"
                                className="text-xs"
                                label={{ value: 'Energia (kWh)', angle: -90, position: 'insideLeft' }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                className="text-xs"
                                label={{ value: 'Potência (W)', angle: 90, position: 'insideRight' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--background)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '6px',
                                }}
                                formatter={(value: number, name: string) => {
                                    if (name === 'energia') return [value.toFixed(2) + ' kWh', 'Energia'];
                                    if (name === 'potencia') return [value.toFixed(2) + ' W', 'Potência'];
                                    return [value, name];
                                }}
                            />
                            <Legend />
                            <Bar
                                yAxisId="left"
                                dataKey="energia"
                                fill="var(--chart-1)"
                                name="Energia (kWh)"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                yAxisId="right"
                                dataKey="potencia"
                                fill="var(--chart-2)"
                                name="Potência (W)"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    ) : (
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorEnergia" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="colorPotencia" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="timestamp"
                                className="text-xs"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis
                                yAxisId="left"
                                className="text-xs"
                                label={{ value: 'Energia (kWh)', angle: -90, position: 'insideLeft' }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                className="text-xs"
                                label={{ value: 'Potência (W)', angle: 90, position: 'insideRight' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--background)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '6px',
                                }}
                                formatter={(value: number, name: string) => {
                                    if (name === 'energia') return [value.toFixed(2) + ' kWh', 'Energia'];
                                    if (name === 'potencia') return [value.toFixed(2) + ' W', 'Potência'];
                                    return [value, name];
                                }}
                                labelFormatter={(label) => {
                                    const point = chartData.find(d => d.timestamp === label);
                                    if (point) {
                                        return format(new Date(point.fullTimestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR });
                                    }
                                    return label;
                                }}
                            />
                            <Legend />
                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="energia"
                                stroke="var(--chart-1)"
                                strokeWidth={3}
                                fill="url(#colorEnergia)"
                                name="Energia (kWh)"
                                dot={{ fill: 'var(--chart-1)', r: 4, strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 2 }}
                            />
                            <Area
                                yAxisId="right"
                                type="monotone"
                                dataKey="potencia"
                                stroke="var(--chart-2)"
                                strokeWidth={2}
                                fill="url(#colorPotencia)"
                                name="Potência (W)"
                                dot={{ fill: 'var(--chart-2)', r: 3, strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 5, strokeWidth: 2 }}
                            />
                        </AreaChart>
                    )}
                </ResponsiveContainer>
            )}
        </>
    );
}
