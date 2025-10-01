'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardAnalytics } from "../../hooks/use-generation-dashboard";

interface TimeSeriesChartProps {
    analytics: DashboardAnalytics;
}

export function TimeSeriesChart({ analytics }: TimeSeriesChartProps) {
    const { timeSeries } = analytics;

    const chartData = timeSeries.map(point => ({
        timestamp: new Date(point.timestamp).toLocaleString('pt-BR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }),
        energia: point.energy,
        potencia: point.power,
        inversores: point.inverterCount,
    }));

    return (
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle>Geração ao Longo do Tempo</CardTitle>
                <CardDescription>
                    Energia e potência agregadas de todos os inversores
                </CardDescription>
            </CardHeader>
            <CardContent>
                {chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        Nenhum dado disponível para o período selecionado
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
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
                                    backgroundColor: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '6px',
                                }}
                            />
                            <Legend />
                            <Line 
                                yAxisId="left"
                                type="monotone" 
                                dataKey="energia" 
                                stroke="hsl(var(--chart-1))" 
                                strokeWidth={2}
                                name="Energia (kWh)"
                                dot={{ fill: 'hsl(var(--chart-1))' }}
                            />
                            <Line 
                                yAxisId="right"
                                type="monotone" 
                                dataKey="potencia" 
                                stroke="hsl(var(--chart-2))" 
                                strokeWidth={2}
                                name="Potência (W)"
                                dot={{ fill: 'hsl(var(--chart-2))' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
