'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { DashboardAnalytics } from "../../hooks/use-generation-dashboard";

interface TypeDistributionChartProps {
    analytics: DashboardAnalytics;
}

const COLORS = {
    real_time: 'var(--chart-1)',
    day: 'var(--chart-2)',
    month: 'var(--chart-3)',
    year: 'var(--chart-4)',
};

const TYPE_LABELS = {
    real_time: 'Tempo Real',
    day: 'Diário',
    month: 'Mensal',
    year: 'Anual',
};

export function TypeDistributionChart({ analytics }: TypeDistributionChartProps) {
    const { byType } = analytics;

    const chartData = Object.entries(byType)
        .filter(([_, data]) => data && data.totalEnergy > 0)
        .map(([type, data]) => ({
            name: TYPE_LABELS[type as keyof typeof TYPE_LABELS],
            value: data!.totalEnergy,
            dataPoints: data!.dataPoints,
            type: type,
        }));

    const totalEnergy = chartData.reduce((sum, item) => sum + item.value, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Distribuição por Tipo</CardTitle>
                <CardDescription>
                    Energia gerada por tipo de medição
                </CardDescription>
            </CardHeader>
            <CardContent>
                {chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        Nenhum dado disponível
                    </div>
                ) : (
                    <div className="space-y-4">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={COLORS[entry.type as keyof typeof COLORS]} 
                                        />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '6px',
                                    }}
                                    formatter={(value: number) => [
                                        `${value.toFixed(2)} kWh`,
                                        'Energia'
                                    ]}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                        
                        <div className="space-y-2">
                            {chartData.map((item, index) => {
                                const percentage = ((item.value / totalEnergy) * 100).toFixed(1);
                                return (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div 
                                                className="w-3 h-3 rounded-full" 
                                                style={{ backgroundColor: COLORS[item.type as keyof typeof COLORS] }}
                                            />
                                            <span className="font-medium">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-muted-foreground">
                                                {item.dataPoints} pontos
                                            </span>
                                            <span className="font-semibold">
                                                {item.value.toFixed(2)} kWh ({percentage}%)
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
