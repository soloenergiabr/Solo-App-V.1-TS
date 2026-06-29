'use client';

import { useEffect, useState } from 'react';
import { Split } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { PageLayout, PageHeader, PageEmpty } from '@/components/ui/page-layout';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import { useRateio, useCreateProposal, type RateioAllocation } from './hooks/use-rateio';
import { EnelSyncBadge } from './enel-sync-badge';
import { RateioEditor } from './rateio-editor';
import { RateioStatusTimeline } from './rateio-status-timeline';
import { RateioAuditList } from './rateio-audit-list';

interface PlantWithUnits {
    id: string;
    name: string | null;
    allocations: RateioAllocation[];
}

interface PlantOption {
    id: string;
    name: string | null;
}

interface UnitOption {
    id: string;
    name: string | null;
    clientNumber: string | null;
    plantId: string;
}

export function RateioScreen({ embedded }: { embedded?: boolean }) {
    const api = useAuthenticatedApi();
    const {
        data: allocations,
        isLoading,
        error,
        refetch,
    } = useRateio();
    const createProposal = useCreateProposal();
    const [expandedPlantId, setExpandedPlantId] = useState<string | null>(null);
    const [selectedAllocation, setSelectedAllocation] = useState<RateioAllocation | null>(null);
    const [plants, setPlants] = useState<PlantOption[]>([]);
    const [generatorUnits, setGeneratorUnits] = useState<UnitOption[]>([]);
    const [consumerUnits, setConsumerUnits] = useState<UnitOption[]>([]);
    const [editorReady, setEditorReady] = useState(false);

    // Fetch plants and units for the editor
    useEffect(() => {
        if (!api.isAuthenticated) return;
        Promise.all([
            api.get('/client/plants'),
            api.get('/client/consumer-units'),
        ])
            .then(([plantsRes, unitsRes]) => {
                const plantList = Array.isArray(plantsRes?.data?.data) ? plantsRes.data.data : [];
                if (plantsRes?.data?.success) {
                    setPlants(plantList.map((p: PlantOption) => ({ id: p.id, name: p.name ?? null })));
                }
                const unitList = Array.isArray(unitsRes?.data?.data) ? unitsRes.data.data : [];
                if (unitsRes?.data?.success) {
                    const units: UnitOption[] = unitList.map((u: UnitOption) => ({
                        id: u.id,
                        name: u.name ?? null,
                        clientNumber: u.clientNumber ?? null,
                        plantId: u.plantId,
                    }));
                    setGeneratorUnits(units);
                    setConsumerUnits(units);
                }
            })
            .catch((err) => { console.error('[rateio] failed to load plants/units', err); })
            .finally(() => setEditorReady(true));
    }, [api, api.isAuthenticated]);

    // Reset selected allocation when data refetches
    useEffect(() => {
        setSelectedAllocation(null);
    }, [allocations]);

    // Group allocations by plant
    const plantsMap = new Map<string, PlantWithUnits>();
    if (allocations) {
        for (const a of allocations) {
            const plantId = a.plant?.id ?? a.plantId ?? 'unknown';
            if (!plantsMap.has(plantId)) {
                plantsMap.set(plantId, {
                    id: plantId,
                    name: a.plant?.name ?? 'Usina',
                    allocations: [],
                });
            }
            plantsMap.get(plantId)!.allocations.push(a);
        }
    }
    const plantsWithAllocations = Array.from(plantsMap.values());

    const body = (
        <>
            {/* Loading state */}
            {isLoading && (
                <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            )}

            {/* Error state */}
            {!isLoading && error && (
                <Alert variant="destructive">
                    <AlertTitle>Erro ao carregar rateios</AlertTitle>
                    <AlertDescription>{error?.message ?? 'Erro ao carregar rateios'}</AlertDescription>
                </Alert>
            )}

            {/* Empty state */}
            {!isLoading && !error && allocations != null && allocations.length === 0 && (
                <>
                    <PageEmpty
                        icon={Split}
                        title="Nenhum rateio configurado ainda"
                        description="Os rateios de créditos aparecerão aqui quando forem configurados pelo administrador."
                    />
                    <div className="flex justify-center pt-4">
                        {editorReady && (
                            <RateioEditor
                                plants={plants}
                                generatorUnits={generatorUnits}
                                consumerUnits={consumerUnits}
                                onSuccess={refetch}
                                trigger={
                                    <Button variant="default" size="lg">
                                        Propor novo rateio
                                    </Button>
                                }
                            />
                        )}
                    </div>
                </>
            )}

            {/* Content */}
            {!isLoading && !error && allocations && allocations.length > 0 && (
                <div className="space-y-6">
                    {plantsWithAllocations.map((plant) => (
                        <Collapsible
                            key={plant.id}
                            open={expandedPlantId === plant.id}
                            onOpenChange={(open) =>
                                setExpandedPlantId(open ? plant.id : null)
                            }
                        >
                            <Card>
                                <CollapsibleTrigger asChild>
                                    <CardHeader className="cursor-pointer hover:bg-muted/50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-lg">
                                                    {plant.name}
                                                </CardTitle>
                                                <CardDescription>
                                                    {plant.allocations.length}{' '}
                                                    {plant.allocations.length === 1
                                                        ? 'rateio'
                                                        : 'rateios'}
                                                </CardDescription>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                {expandedPlantId === plant.id
                                                    ? 'Recolher'
                                                    : 'Expandir'}
                                            </Button>
                                        </div>
                                    </CardHeader>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <CardContent className="space-y-4">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>De</TableHead>
                                                    <TableHead>Para</TableHead>
                                                    <TableHead>Percentual</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Data de solicitação</TableHead>
                                                    <TableHead className="text-right">
                                                        Ações
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {plant.allocations.map((a) => (
                                                    <TableRow key={a.id}>
                                                        <TableCell className="font-medium">
                                                            {a.from?.name ||
                                                                a.from?.clientNumber ||
                                                                a.fromId}
                                                        </TableCell>
                                                        <TableCell>
                                                            {a.to?.name ||
                                                                a.to?.clientNumber ||
                                                                a.toId}
                                                        </TableCell>
                                                        <TableCell>
                                                            {Number(
                                                                a.allocationPercentage
                                                            ).toLocaleString('pt-BR', {
                                                                maximumFractionDigits: 1,
                                                            })}
                                                            %
                                                        </TableCell>
                                                        <TableCell>
                                                            <EnelSyncBadge
                                                                status={a.enelSyncStatus}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {a.requestedAt
                                                                ? new Date(
                                                                      a.requestedAt
                                                                  ).toLocaleDateString(
                                                                      'pt-BR'
                                                                  )
                                                                : '-'}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    setSelectedAllocation(
                                                                        selectedAllocation?.id ===
                                                                            a.id
                                                                            ? null
                                                                            : a
                                                                    )
                                                                }
                                                            >
                                                                Detalhes
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>

                                        {/* Selected allocation details */}
                                        {selectedAllocation &&
                                            selectedAllocation.plantId === plant.id && (
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle className="text-sm">
                                                                Linha do tempo
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <RateioStatusTimeline
                                                                status={
                                                                    selectedAllocation.enelSyncStatus
                                                                }
                                                                createdAt={
                                                                    selectedAllocation.createdAt
                                                                }
                                                                requestedAt={
                                                                    selectedAllocation.requestedAt
                                                                }
                                                                appliedAt={
                                                                    selectedAllocation.appliedAt
                                                                }
                                                                syncError={
                                                                    selectedAllocation.syncError
                                                                }
                                                            />
                                                        </CardContent>
                                                    </Card>
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle className="text-sm">
                                                                Histórico de alterações
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <RateioAuditList
                                                                createdAt={
                                                                    selectedAllocation.createdAt
                                                                }
                                                                requestedAt={
                                                                    selectedAllocation.requestedAt
                                                                }
                                                                appliedAt={
                                                                    selectedAllocation.appliedAt
                                                                }
                                                                enelSyncStatus={
                                                                    selectedAllocation.enelSyncStatus
                                                                }
                                                                syncError={
                                                                    selectedAllocation.syncError
                                                                }
                                                            />
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            )}
                                    </CardContent>
                                </CollapsibleContent>
                            </Card>
                        </Collapsible>
                    ))}

                    {/* Propose new rateio button */}
                    <div className="flex justify-center pt-4">
                        {editorReady && (
                            <RateioEditor
                                plants={plants}
                                generatorUnits={generatorUnits}
                                consumerUnits={consumerUnits}
                                onSuccess={refetch}
                                trigger={
                                    <Button variant="default" size="lg">
                                        Propor novo rateio
                                    </Button>
                                }
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    );

    if (embedded) {
        return <ErrorBoundary>{body}</ErrorBoundary>;
    }

    return (
        <PageLayout
            header={
                <PageHeader
                    title="Rateio de Créditos"
                    subtitle="Acompanhe a distribuição dos créditos de energia entre as unidades consumidoras"
                />
            }
        >
            <ErrorBoundary>{body}</ErrorBoundary>
        </PageLayout>
    );
}
