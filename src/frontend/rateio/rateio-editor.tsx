'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';

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

interface RateioEditorProps {
    plants: PlantOption[];
    generatorUnits: UnitOption[];
    consumerUnits: UnitOption[];
    onSuccess: () => void;
    trigger?: React.ReactNode;
}

export function RateioEditor({ plants, generatorUnits, consumerUnits, onSuccess, trigger }: RateioEditorProps) {
    const api = useAuthenticatedApi();
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        plantId: '',
        fromId: '',
        toId: '',
        allocationPercentage: '',
        startsAt: '',
    });

    const filteredGenerators = generatorUnits.filter((u) => u.plantId === form.plantId);
    const filteredConsumers = consumerUnits.filter((u) => u.plantId === form.plantId);

    const submit = async () => {
        if (!form.plantId || !form.fromId || !form.toId || !form.allocationPercentage) {
            toast.error('Preencha todos os campos obrigatórios');
            return;
        }

        const percentage = Number(form.allocationPercentage);
        if (percentage < 0 || percentage > 100) {
            toast.error('Percentual deve estar entre 0 e 100');
            return;
        }

        // Fetch current allocations for the selected plant to validate sum <= 100
        try {
            const res = await api.get('/rateio');
            if (res.data.success) {
                const existingAllocations = (res.data.data as any[]).filter(
                    (a: any) => a.plantId === form.plantId && a.isActive && a.id !== undefined
                );
                const currentSum = existingAllocations
                    .filter((a: any) => a.fromId !== form.fromId || a.toId !== form.toId)
                    .reduce((sum: number, a: any) => sum + Number(a.allocationPercentage), 0);

                if (currentSum + percentage > 100) {
                    toast.error(`Soma dos rateios excede 100% (${currentSum}% + ${percentage}% = ${currentSum + percentage}%)`);
                    return;
                }
            }
        } catch {
            // Continue even if validation fails
        }

        setSubmitting(true);
        try {
            await api.post('/rateio/proposals', {
                plantId: form.plantId,
                fromId: form.fromId,
                toId: form.toId,
                allocationPercentage: percentage,
                startsAt: form.startsAt || undefined,
            });
            toast.success('Proposta de rateio enviada com sucesso');
            setOpen(false);
            setForm({ plantId: '', fromId: '', toId: '', allocationPercentage: '', startsAt: '' });
            onSuccess();
        } catch (e: any) {
            toast.error(e?.response?.data?.message || 'Erro ao enviar proposta de rateio');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? <Button variant="default">Propor alteracao</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Propor alteracao de rateio</DialogTitle>
                    <DialogDescription>
                        Defina a distribuicao de creditos entre unidades da mesma usina.
                        A alteracao sera enviada para aprovacao.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {/* Plant selector */}
                    <div className="space-y-2">
                        <Label>Usina</Label>
                        <Select
                            value={form.plantId}
                            onValueChange={(value) =>
                                setForm((prev) => ({ ...prev, plantId: value, fromId: '', toId: '' }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione uma usina" />
                            </SelectTrigger>
                            <SelectContent>
                                {plants.map((plant) => (
                                    <SelectItem key={plant.id} value={plant.id}>
                                        {plant.name || plant.id}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Origin unit */}
                    <div className="space-y-2">
                        <Label>Origem (geradora)</Label>
                        <Select
                            value={form.fromId}
                            onValueChange={(value) => setForm((prev) => ({ ...prev, fromId: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a origem" />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredGenerators.map((unit) => (
                                    <SelectItem key={unit.id} value={unit.id}>
                                        {unit.name || unit.clientNumber || unit.id}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Destination unit */}
                    <div className="space-y-2">
                        <Label>Destino (consumidora)</Label>
                        <Select
                            value={form.toId}
                            onValueChange={(value) => setForm((prev) => ({ ...prev, toId: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o destino" />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredConsumers.map((unit) => (
                                    <SelectItem key={unit.id} value={unit.id}>
                                        {unit.name || unit.clientNumber || unit.id}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Percentage */}
                    <div className="space-y-2">
                        <Label>Percentual (%)</Label>
                        <Input
                            type="number"
                            min={0}
                            max={100}
                            placeholder="Ex: 50"
                            value={form.allocationPercentage}
                            onChange={(e) => setForm((prev) => ({ ...prev, allocationPercentage: e.target.value }))}
                        />
                    </div>

                    {/* Start date */}
                    <div className="space-y-2">
                        <Label>Data de inicio (opcional)</Label>
                        <Input
                            type="date"
                            value={form.startsAt}
                            onChange={(e) => setForm((prev) => ({ ...prev, startsAt: e.target.value }))}
                        />
                    </div>

                    {form.allocationPercentage && Number(form.allocationPercentage) > 0 && (
                        <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                            Programado para o proximo ciclo de faturamento
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                        Cancelar
                    </Button>
                    <Button onClick={submit} disabled={submitting}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enviar proposta
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
