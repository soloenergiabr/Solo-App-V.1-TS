'use client';

import { useEffect, useState } from 'react';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import { useControleOverview } from '@/frontend/controle/hooks/use-controle-overview';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

type PlantSummary = {
    _count?: {
        inverters: number;
        consumerUnits: number;
        energyBills: number;
    };
};

export function OnboardingChecklist() {
    const { overview } = useControleOverview();
    const api = useAuthenticatedApi();
    const [plants, setPlants] = useState<PlantSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!api.isAuthenticated) return;
        api.get('/client/plants')
            .then((res) => {
                if (res.data.success) setPlants(res.data.data);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [api.isAuthenticated]);

    const pendingCount = overview?.pendingValidationCount ?? 0;

    const hasPlants = plants.length > 0;
    const hasInverters = plants.some((p) => (p._count?.inverters ?? 0) > 0);
    const hasConsumerUnits = plants.some((p) => (p._count?.consumerUnits ?? 0) > 0);
    const hasEnergyBills = plants.some((p) => (p._count?.energyBills ?? 0) > 0);

    const checklist = [
        { label: 'Usina cadastrada', done: hasPlants },
        { label: 'Geração informada', done: hasInverters },
        { label: 'Unidade consumidora', done: hasConsumerUnits },
        { label: 'Primeira fatura', done: hasEnergyBills },
    ];

    if (loading) return null;

    return (
        <>
            {/* Pending validation banner */}
            {pendingCount > 0 && (
                <Alert>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertTitle>
                        {pendingCount} item(ns) aguardando validação da Solo
                    </AlertTitle>
                </Alert>
            )}

            {/* Onboarding checklist card */}
            <Card>
                <CardHeader>
                    <CardTitle>Configuração da sua conta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {checklist.map((item) => (
                        <div
                            key={item.label}
                            className="flex items-center justify-between"
                        >
                            <span className="text-sm">{item.label}</span>
                            <Badge variant={item.done ? 'default' : 'secondary'}>
                                {item.done ? 'Concluído' : 'Pendente'}
                            </Badge>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </>
    );
}
