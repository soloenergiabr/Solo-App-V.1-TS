'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardAnalytics, DashboardFilters } from "../../hooks/use-generation-dashboard";
import { format, getDaysInMonth, startOfMonth, addDays, getYear, startOfYear, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AdaptiveChartProps {
    analytics: DashboardAnalytics;
    viewType: DashboardFilters['generationUnitType'];
}

export function AdaptiveChart({ analytics, viewType }: AdaptiveChartProps) {
    const { timeSeries } = analytics;

    // Helper para preencher dados faltantes
    const fillMissingData = () => {
        if (viewType === 'real_time') {
            // Tempo real: mantém apenas os dados existentes
            return timeSeries.map(point => ({
                timestamp: format(new Date(point.timestamp), 'HH:mm', { locale: ptBR }),
                fullTimestamp: point.timestamp,
                energia: point.energy,
                potencia: point.power,
                inversores: point.inverterCount,
            }));
        }

        if (viewType === 'day') {
            // Diário (por mês): Mostra todos os dias do mês
            if (timeSeries.length === 0) return [];

            const firstDate = new Date(timeSeries[0].timestamp);
            const daysInMonth = getDaysInMonth(firstDate);
            const monthStart = startOfMonth(firstDate);

            // Criar mapa de dados existentes por dia
            const dataMap = new Map<string, typeof timeSeries[0]>();
            timeSeries.forEach(point => {
                const dayKey = format(new Date(point.timestamp), 'yyyy-MM-dd');
                if (!dataMap.has(dayKey)) {
                    dataMap.set(dayKey, point);
                } else {
                    // Agregar se houver múltiplos pontos no mesmo dia
                    const existing = dataMap.get(dayKey)!;
                    dataMap.set(dayKey, {
                        ...existing,
                        energy: existing.energy + point.energy,
                        power: Math.max(existing.power, point.power),
                    });
                }
            });

            // Criar array com todos os dias do mês
            const allDays = [];
            for (let i = 0; i < daysInMonth; i++) {
                const currentDay = addDays(monthStart, i);
                const dayKey = format(currentDay, 'yyyy-MM-dd');
                const data = dataMap.get(dayKey);

                allDays.push({
                    timestamp: format(currentDay, 'dd', { locale: ptBR }),
                    fullTimestamp: currentDay.toISOString(),
                    energia: data?.energy || 0,
                    potencia: data?.power || 0,
                    inversores: data?.inverterCount || 0,
                });
            }

            return allDays;
        }

        if (viewType === 'month') {
            // Mensal (por ano): Mostra todos os meses do ano
            if (timeSeries.length === 0) return [];

            const firstDate = new Date(timeSeries[0].timestamp);
            const year = getYear(firstDate);
            const yearStart = startOfYear(firstDate);

            // Criar mapa de dados existentes por mês
            const dataMap = new Map<string, typeof timeSeries[0]>();
            timeSeries.forEach(point => {
                const monthKey = format(new Date(point.timestamp), 'yyyy-MM');
                if (!dataMap.has(monthKey)) {
                    dataMap.set(monthKey, point);
                } else {
                    // Agregar se houver múltiplos pontos no mesmo mês
                    const existing = dataMap.get(monthKey)!;
                    dataMap.set(monthKey, {
                        ...existing,
                        energy: existing.energy + point.energy,
                        power: Math.max(existing.power, point.power),
                    });
                }
            });

            // Criar array com todos os meses do ano
            const allMonths = [];
            for (let i = 0; i < 12; i++) {
                const currentMonth = addMonths(yearStart, i);
                const monthKey = format(currentMonth, 'yyyy-MM');
                const data = dataMap.get(monthKey);

                allMonths.push({
                    timestamp: format(currentMonth, 'MMM', { locale: ptBR }),
                    fullTimestamp: currentMonth.toISOString(),
                    energia: data?.energy || 0,
                    potencia: data?.power || 0,
                    inversores: data?.inverterCount || 0,
                });
            }

            return allMonths;
        }

        if (viewType === 'year') {
            // Anual: Mostra apenas os anos que têm dados (agregado)
            const yearMap = new Map<number, { energy: number; power: number; count: number; timestamp: string }>();

            timeSeries.forEach(point => {
                const year = getYear(new Date(point.timestamp));
                if (!yearMap.has(year)) {
                    yearMap.set(year, {
                        energy: point.energy,
                        power: point.power,
                        count: 1,
                        timestamp: point.timestamp,
                    });
                } else {
                    const existing = yearMap.get(year)!;
                    yearMap.set(year, {
                        energy: existing.energy + point.energy,
                        power: Math.max(existing.power, point.power),
                        count: existing.count + 1,
                        timestamp: existing.timestamp,
                    });
                }
            });

            // Converter para array e ordenar por ano
            return Array.from(yearMap.entries())
                .sort((a, b) => a[0] - b[0])
                .map(([year, data]) => ({
                    timestamp: year.toString(),
                    fullTimestamp: data.timestamp,
                    energia: data.energy,
                    potencia: data.power,
                    inversores: 0,
                }));
        }

        return [];
    };

    const chartData = fillMissingData();

    const getTitle = () => {
        if (viewType === 'real_time') return 'Geração em Tempo Real';
        if (viewType === 'day') return 'Geração Diária do Mês';
        if (viewType === 'month') return 'Geração Mensal do Ano';
        return 'Geração Anual';
    };

    const getDescription = () => {
        if (viewType === 'real_time') {
            return 'Evolução em tempo real da geração de energia';
        } else if (viewType === 'day') {
            return 'Geração de cada dia do mês selecionado';
        } else if (viewType === 'month') {
            return 'Geração de cada mês do ano selecionado';
        }
        return 'Geração agregada por ano';
    };

    // Para real_time: Line Chart (Area)
    // Para day, month, year: Bar Chart
    const useBarChart = viewType === 'day' || viewType === 'month' || viewType === 'year';

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
                                angle={viewType === 'day' ? -45 : 0}
                                textAnchor={viewType === 'day' ? 'end' : 'middle'}
                                height={viewType === 'day' ? 80 : 50}
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
