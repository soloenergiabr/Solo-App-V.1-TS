'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardAnalytics } from "../../hooks/use-generation-dashboard";

interface InvertersComparisonChartProps {
    analytics: DashboardAnalytics;
}

export function InvertersComparisonChart({ analytics }: InvertersComparisonChartProps) {
    const { byInverter } = analytics;

    const chartData = byInverter.map(inverter => ({
        name: inverter.inverterName,
        energia: inverter.totalEnergy,
        potenciaPico: inverter.peakPower,
        potenciaMedia: inverter.averagePower,
    }));

    return (
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle>Comparação entre Inversores</CardTitle>
                <CardDescription>
                    Performance comparativa de energia e potência
                </CardDescription>
            </CardHeader>
            <CardContent>
                {chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        Nenhum dado disponível
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis 
                                dataKey="name" 
                                className="text-xs"
                                angle={-45}
                                textAnchor="end"
                                height={100}
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
                            <Bar 
                                yAxisId="left"
                                dataKey="energia" 
                                fill="hsl(var(--chart-1))" 
                                name="Energia Total (kWh)"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar 
                                yAxisId="right"
                                dataKey="potenciaPico" 
                                fill="hsl(var(--chart-2))" 
                                name="Potência Pico (W)"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar 
                                yAxisId="right"
                                dataKey="potenciaMedia" 
                                fill="hsl(var(--chart-3))" 
                                name="Potência Média (W)"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
