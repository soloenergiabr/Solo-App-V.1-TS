'use client';

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
import { statusToColor, type TelemetryStatus } from "@/frontend/telemetry-kit";

interface InvertersTableProps {
    analytics: DashboardAnalytics;
}

function deriveStatus(inverter: DashboardAnalytics['byInverter'][number]): TelemetryStatus {
    if (!inverter.dataPoints) return 'unknown';
    if (inverter.totalPower <= 0 && inverter.peakPower <= 0) return 'warning';
    return 'ok';
}

export function InvertersTable({ analytics }: InvertersTableProps) {
    const { byInverter } = analytics;

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(num);
    };

    return (
        <div className="col-span-full rounded-2xl border bg-card p-4">
            <div className="mb-4">
                <h2 className="font-display text-lg font-semibold text-foreground">Desempenho por Inversor</h2>
                <p className="text-sm text-muted-foreground">Métricas detalhadas de cada inversor</p>
            </div>
            {byInverter.length === 0 ? (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                    Nenhum inversor encontrado
                </div>
            ) : (
                <div className="rounded-md border border-border">
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
                            {byInverter.map((inverter) => {
                                const status = deriveStatus(inverter);
                                return (
                                    <TableRow key={inverter.inverterId}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`inline-block h-2 w-2 rounded-full bg-current ${statusToColor(status)}`}
                                                    aria-hidden="true"
                                                />
                                                {inverter.inverterName}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className="bg-muted text-muted-foreground"
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
                                        <TableCell className="text-right font-medium text-foreground">
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
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
