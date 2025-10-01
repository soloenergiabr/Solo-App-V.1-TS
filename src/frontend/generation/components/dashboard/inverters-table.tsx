'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DashboardAnalytics } from "../../hooks/use-generation-dashboard";
import { TrendingUp, Zap, Activity } from "lucide-react";

interface InvertersTableProps {
    analytics: DashboardAnalytics;
}

export function InvertersTable({ analytics }: InvertersTableProps) {
    const { byInverter } = analytics;

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(num);
    };

    const getProviderColor = (provider: string) => {
        const colors: Record<string, string> = {
            solis: 'bg-blue-100 text-blue-800',
            growatt: 'bg-green-100 text-green-800',
            solplanet: 'bg-purple-100 text-purple-800',
            mock: 'bg-gray-100 text-gray-800',
        };
        return colors[provider.toLowerCase()] || 'bg-gray-100 text-gray-800';
    };

    return (
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle>Desempenho por Inversor</CardTitle>
                <CardDescription>
                    Métricas detalhadas de cada inversor
                </CardDescription>
            </CardHeader>
            <CardContent>
                {byInverter.length === 0 ? (
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                        Nenhum inversor encontrado
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Inversor</TableHead>
                                    <TableHead>Provider</TableHead>
                                    <TableHead className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Zap className="h-3 w-3" />
                                            Energia Total
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Activity className="h-3 w-3" />
                                            Potência Média
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <TrendingUp className="h-3 w-3" />
                                            Pico
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right">Pontos</TableHead>
                                    <TableHead>Última Atualização</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {byInverter.map((inverter) => (
                                    <TableRow key={inverter.inverterId}>
                                        <TableCell className="font-medium">
                                            {inverter.inverterName}
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant="secondary" 
                                                className={getProviderColor(inverter.provider)}
                                            >
                                                {inverter.provider.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {formatNumber(inverter.totalEnergy)} kWh
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatNumber(inverter.averagePower)} W
                                        </TableCell>
                                        <TableCell className="text-right text-green-600 font-medium">
                                            {formatNumber(inverter.peakPower)} W
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {inverter.dataPoints}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {inverter.lastUpdate 
                                                ? new Date(inverter.lastUpdate).toLocaleString('pt-BR')
                                                : 'N/A'
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
