import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, CartesianGrid } from "recharts";
import { format, startOfYear, addMonths, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConsumptionChartProps {
    data: {
        competenceDate: string;
        consumptionKwh: number;
        injectedEnergyKwh: number;
        tariffPerKwh: number;
        totalBillValue: number;
    }[];
    periodLabel: string; // e.g. "2023"
}

export function ConsumptionChart({ data, periodLabel }: ConsumptionChartProps) {
    // Fill missing months for the year
    const fillMissingData = () => {
        const year = parseInt(periodLabel, 10);
        if (isNaN(year)) return [];

        const yearStart = startOfYear(new Date(year, 0, 1));

        // Map existing data
        const dataMap = new Map<string, typeof data[0]>();
        data.forEach(item => {
            // Fix: Parse manually to avoid timezone shift from UTC to Local
            // Assuming string is ISO like "2023-01-01T00:00:00.000Z"
            const dateStr = item.competenceDate.split('T')[0];
            const [yStr, mStr, dStr] = dateStr.split('-');
            const date = new Date(parseInt(yStr), parseInt(mStr) - 1, parseInt(dStr));

            // Ensure we are only mapping for the correct year just in case
            if (getYear(date) === year) {
                const monthKey = format(date, 'MM');
                dataMap.set(monthKey, item);
            }
        });

        const allMonths = [];
        for (let i = 0; i < 12; i++) {
            const currentMonth = addMonths(yearStart, i);
            const monthKey = format(currentMonth, 'MM');
            const item = dataMap.get(monthKey);

            // Calculate savings if data exists
            // Estimated Bill = (Consumption + Injected) * Tariff
            // Savings = Estimated - Actual Bill
            let savings = 0;
            if (item) {
                const estimated = (item.consumptionKwh + item.injectedEnergyKwh) * item.tariffPerKwh;
                savings = estimated - item.totalBillValue;
            }

            allMonths.push({
                name: format(currentMonth, 'MMM', { locale: ptBR }), // Jan, Fev, etc.
                fullDate: currentMonth.toISOString(),
                consumption: item?.consumptionKwh || 0,
                injected: item?.injectedEnergyKwh || 0,
                savings: savings > 0 ? savings : 0,
            });
        }
        return allMonths;
    };

    const chartData = fillMissingData();

    return (
        <>
            <CardHeader>
                <CardTitle>Histórico de Consumo - {periodLabel}</CardTitle>
                <CardDescription>
                    Comparativo mensal de energia consumida, injetada e economia gerada
                </CardDescription>
            </CardHeader>
            <div className="p-4">
                <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="name"
                            className="text-xs"
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            yAxisId="left"
                            className="text-xs"
                            tickLine={false}
                            axisLine={false}
                            label={{ value: 'Energia (kWh)', angle: -90, position: 'insideLeft' }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            className="text-xs"
                            tickLine={false}
                            axisLine={false}
                            label={{ value: 'Economia (R$)', angle: 90, position: 'insideRight' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--background)',
                                border: '1px solid var(--border)',
                                borderRadius: '6px',
                            }}
                            formatter={(value: number, name: string) => {
                                if (name === 'Economia') {
                                    return [
                                        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
                                        name
                                    ];
                                }
                                if (name === 'Consumo' || name === 'Injetado') {
                                    return [
                                        new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value) + ' kWh',
                                        name
                                    ];
                                }
                                return [value, name];
                            }}
                        />
                        <Legend />
                        <Bar
                            yAxisId="left"
                            dataKey="consumption"
                            name="Consumo"
                            fill="var(--chart-1)" // Using chart-1 from theme (likely blue or primary)
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar
                            yAxisId="left"
                            dataKey="injected"
                            name="Injetado"
                            fill="var(--chart-2)" // Using chart-2 
                            radius={[4, 4, 0, 0]}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="savings"
                            name="Economia"
                            stroke="#22c55e" // Green-500
                            strokeWidth={3}
                            dot={{ r: 4, fill: "#22c55e", strokeWidth: 2, stroke: "#fff" }}
                            activeDot={{ r: 6 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </>
    );
}
