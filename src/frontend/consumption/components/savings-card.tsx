import { TrophyIcon, TrendingUp, Zap } from "lucide-react";

interface SavingsCardProps {
    totalSavings: number;
    lastMonthSavings?: number;
}

export function SavingsCard({ totalSavings, lastMonthSavings }: SavingsCardProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const metrics = [
        {
            label: "Economia Total",
            value: formatCurrency(totalSavings),
            icon: TrophyIcon,
            color: "text-yellow-500",
        },
        {
            label: "Economia Último Mês",
            value: lastMonthSavings ? formatCurrency(lastMonthSavings) : "R$ 0,00",
            icon: TrendingUp,
            color: "text-green-500",
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {metrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                    <div key={index} className="flex flex-col items-center justify-center p-4 rounded-lg bg-card border shadow-sm">
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
