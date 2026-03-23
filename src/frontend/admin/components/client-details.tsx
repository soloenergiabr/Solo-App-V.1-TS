'use client';

import { useEffect, useState } from 'react';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import { Loader2, ArrowLeft, Battery, Zap, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ManualTransactionDialog } from './manual-transaction-dialog';
import { RegisterInverterDialog } from './register-inverter-dialog';
import { EditInverterDialog } from './edit-inverter-dialog';
import { useGenerationDashboard } from '@/frontend/generation/hooks/use-generation-dashboard';
import { CompactMetrics } from '@/frontend/generation/components/dashboard/compact-metrics';
import { PeriodTabs } from '@/frontend/generation/components/dashboard/period-tabs';
import { AdaptiveChart } from '@/frontend/generation/components/dashboard/adaptive-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientConsumptionTab } from './client-consumption-tab';

interface ClientDetailsData {
    user: {
        id: string;
        name: string;
        email: string;
        isActive: boolean;
        createdAt: string;
        role: string;
    };
    client: {
        id: string;
        name: string;
        email: string;
        cpfCnpj: string;
        phone: string;
        address: string;
        avgEnergyCost: number;
        indicationCode: string;
        status: string;
        createdAt: string;
        updatedAt: string;
    };
    balance: number;
    inverters: Array<{
        id: string;
        name: string;
        provider: string;
        providerId: string;
    }>;
}

interface ClientDetailsProps {
    clientId: string;
}

export function ClientDetails({ clientId }: ClientDetailsProps) {
    const api = useAuthenticatedApi();
    const router = useRouter();
    const [data, setData] = useState<ClientDetailsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const {
        analytics,
        error,
        filters,
        updateFilters,
        refetch,
        goToPreviousPeriod,
        goToNextPeriod,
        goToToday,
        getCurrentPeriodLabel,
    } = useGenerationDashboard({ clientId });

    const [editingInverter, setEditingInverter] = useState<any>(null);

    const fetchDetails = async () => {
        if (!api.isAuthenticated || !clientId) return;

        try {
            setIsLoading(true);
            const response = await api.get(`/admin/clients/${clientId}`);
            if (response.data.success) {
                setData(response.data.data);
            } else {
                toast.error(response.data.message || 'Erro ao buscar detalhes do cliente');
            }
        } catch (error: any) {
            console.error('Error fetching client details:', error);
            toast.error('Erro ao carregar detalhes do cliente');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [clientId]);

    const handleDeleteInverter = async (inverterId: string) => {
        if (!window.confirm('Tem certeza que deseja remover esta conexão de inversor?')) return;
        
        try {
            const response = await api.delete(`/admin/inverters/${inverterId}`);
            if (response.data.success) {
                toast.success('Inversor removido com sucesso!');
                fetchDetails();
            } else {
                toast.error(response.data.message || 'Erro ao remover o inversor');
            }
        } catch (error: any) {
            console.error('Error deleting inverter:', error);
            const msg = error.response?.data?.message || 'Erro de comunicação ao excluir inversor.';
            toast.error(msg);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">Cliente não encontrado.</p>
                <Button variant="link" onClick={() => router.back()}>
                    Voltar
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">{data.client.name}</h1>
                    {/* <Badge variant={data.user.isActive ? 'default' : 'secondary'}>
                        {data.user.isActive ? 'Ativo' : 'Inativo'}
                    </Badge> */}
                </div>
                <div className="flex gap-2">
                    <RegisterInverterDialog clientId={clientId} onSuccess={fetchDetails} />
                    <ManualTransactionDialog clientId={clientId} onSuccess={fetchDetails} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Informações Pessoais</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-muted-foreground">Email:</span>
                            <span className="font-medium">{data.client.email}</span>

                            <span className="text-muted-foreground">Data de Cadastro:</span>
                            <span className="font-medium">
                                {new Date(data.client.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
                        <Battery className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.balance} Solo Coins</div>
                        <p className="text-xs text-muted-foreground">
                            Disponível para resgate
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Inversores Conectados
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {data.inverters.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                            Nenhum inversor conectado a este cliente.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {data.inverters.map((inverter) => (
                                <div key={inverter.id} className="flex items-center justify-between border p-4 rounded-lg hover:bg-muted/10 transition-colors">
                                    <div>
                                        <p className="font-medium">{inverter.name || inverter.provider}</p>
                                        <p className="text-sm text-muted-foreground">Provider: {inverter.provider}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-sm text-muted-foreground hidden sm:block">
                                            ID: {inverter.providerId}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button 
                                                variant="outline" 
                                                size="icon" 
                                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                onClick={() => setEditingInverter(inverter)}
                                                title="Editar"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="icon" 
                                                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                onClick={() => handleDeleteInverter(inverter.id)}
                                                title="Remover"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {editingInverter && (
                <EditInverterDialog 
                    inverter={editingInverter} 
                    open={!!editingInverter} 
                    onOpenChange={(isOpen) => !isOpen && setEditingInverter(null)} 
                    onSuccess={fetchDetails} 
                />
            )}

            <Tabs defaultValue="geracao" className="w-full mt-6">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="geracao">Geração</TabsTrigger>
                    <TabsTrigger value="consumo">Consumo</TabsTrigger>
                </TabsList>

                <TabsContent value="geracao" className="space-y-6 mt-6">
                    {analytics ? (
                        <>
                            <CompactMetrics
                                analytics={analytics}
                                isRealTime={filters.generationUnitType === 'real_time'}
                            />

                            <PeriodTabs
                                filters={filters}
                                currentPeriodLabel={getCurrentPeriodLabel()}
                                onUpdateFilters={updateFilters}
                                onPreviousPeriod={goToPreviousPeriod}
                                onNextPeriod={goToNextPeriod}
                                onToday={goToToday}
                                onRefresh={refetch}
                                isLoading={isLoading}
                            />

                            <AdaptiveChart
                                analytics={analytics}
                                viewType={filters.generationUnitType}
                            />
                        </>
                    ) : (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center h-48">
                                <p className="text-muted-foreground">O dashboard de geração aparecerá aqui após o registro dos inversores.</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="consumo" className="space-y-6 mt-6">
                    <ClientConsumptionTab clientId={clientId} />
                </TabsContent>
            </Tabs>

        </div>
    );
}
