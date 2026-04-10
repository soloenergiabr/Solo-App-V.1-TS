'use client';

import { useState, useEffect } from 'react';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { AddConsumptionDialog } from './add-consumption-dialog';
import { ImportConsumptionDialog } from './import-consumption-dialog';

interface ClientConsumptionTabProps {
    clientId: string;
}

export function ClientConsumptionTab({ clientId }: ClientConsumptionTabProps) {
    const api = useAuthenticatedApi();
    const [isLoading, setIsLoading] = useState(true);
    const [consumptions, setConsumptions] = useState<any[]>([]);

    const fetchConsumptions = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/admin/clients/${clientId}/consumption`);
            if (response.data.success) {
                setConsumptions(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch consumptions', error);
            toast.error('Erro ao buscar o histórico de consumo');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (clientId) {
            fetchConsumptions();
        }
    }, [clientId]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Histórico de Consumo</CardTitle>
                    <CardDescription>Gerencie o consumo mês a mês deste cliente para cálculo de economia e créditos.</CardDescription>
                </div>
                <div className="flex gap-2">
                    <AddConsumptionDialog clientId={clientId} onSuccess={fetchConsumptions} />
                    <ImportConsumptionDialog clientId={clientId} onSuccess={fetchConsumptions} />
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : consumptions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center h-64 border border-dashed rounded-lg">
                        <Calendar className="h-10 w-10 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground font-medium mb-1">Nenhum consumo registrado ainda.</p>
                        <p className="text-sm text-muted-foreground">Adicione manualmente ou importe um PDF da Enel.</p>
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mês/Ano</TableHead>
                                    <TableHead className="text-right">Consumo (kWh)</TableHead>
                                    <TableHead className="text-right">Injetado (kWh)</TableHead>
                                    <TableHead className="text-right">Tarifa (R$)</TableHead>
                                    <TableHead className="text-right">Total Fatura</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {consumptions.map((c) => {
                                    const date = new Date(c.competenceDate);
                                    const monthYear = date.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric', timeZone: 'UTC' });
                                    
                                    return (
                                        <TableRow key={c.id}>
                                            <TableCell className="font-medium">{monthYear}</TableCell>
                                            <TableCell className="text-right">{(c.consumptionKwh ?? 0).toFixed(2)}</TableCell>
                                            <TableCell className="text-right">{(c.injectedEnergyKwh ?? 0).toFixed(2)}</TableCell>
                                            <TableCell className="text-right">{(c.tariffPerKwh ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                            <TableCell className="text-right font-medium">{(c.totalBillValue ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
