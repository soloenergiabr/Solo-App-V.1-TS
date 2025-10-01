import { z } from "zod";
import { InverterRepository } from "../repositories/inverter.repository";
import { GenerationUnitRepository } from "../repositories/generation-unit.repository";
import { UserContext } from '@/backend/auth/models/user-context.model';
import { GenerationUnitType } from "../models/generation-unit.model";

// Request Schema
export const GetDashboardAnalyticsRequestSchema = z.object({
    generationUnitType: z.enum(['real_time', 'day', 'month', 'year']).optional(),
    inverterIds: z.array(z.string()).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

// Response Schema
export const GetDashboardAnalyticsResponseSchema = z.object({
    overview: z.object({
        totalEnergy: z.number(),
        totalPower: z.number(),
        averageEnergy: z.number(),
        averagePower: z.number(),
        peakPower: z.number(),
        peakPowerTimestamp: z.string().optional(),
        totalInverters: z.number(),
        activeInverters: z.number(),
        totalDataPoints: z.number(),
    }),
    timeSeries: z.array(z.object({
        timestamp: z.string(),
        energy: z.number(),
        power: z.number(),
        inverterCount: z.number(),
    })),
    byInverter: z.array(z.object({
        inverterId: z.string(),
        inverterName: z.string(),
        provider: z.string(),
        totalEnergy: z.number(),
        totalPower: z.number(),
        averageEnergy: z.number(),
        averagePower: z.number(),
        peakPower: z.number(),
        dataPoints: z.number(),
        lastUpdate: z.string().optional(),
    })),
    byType: z.object({
        real_time: z.object({
            totalEnergy: z.number(),
            totalPower: z.number(),
            dataPoints: z.number(),
        }).optional(),
        day: z.object({
            totalEnergy: z.number(),
            totalPower: z.number(),
            dataPoints: z.number(),
        }).optional(),
        month: z.object({
            totalEnergy: z.number(),
            totalPower: z.number(),
            dataPoints: z.number(),
        }).optional(),
        year: z.object({
            totalEnergy: z.number(),
            totalPower: z.number(),
            dataPoints: z.number(),
        }).optional(),
    }),
    comparison: z.object({
        previousPeriod: z.object({
            totalEnergy: z.number(),
            totalPower: z.number(),
            dataPoints: z.number(),
        }).optional(),
        percentageChange: z.object({
            energy: z.number(),
            power: z.number(),
        }).optional(),
    }).optional(),
    filters: z.object({
        generationUnitType: z.string().optional(),
        inverterIds: z.array(z.string()).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        appliedFilters: z.number(),
    }),
});

// Types
export type GetDashboardAnalyticsRequest = z.infer<typeof GetDashboardAnalyticsRequestSchema>;
export type GetDashboardAnalyticsResponse = z.infer<typeof GetDashboardAnalyticsResponseSchema>;

export class GetDashboardAnalyticsUseCase {
    constructor(
        private inverterRepository: InverterRepository,
        private generationUnitRepository: GenerationUnitRepository
    ) { }

    async execute(
        userContext: UserContext,
        request?: GetDashboardAnalyticsRequest
    ): Promise<GetDashboardAnalyticsResponse> {
        // Verificar permissões
        if (!userContext.hasPermission('read_generation_data')) {
            throw new Error('User does not have permission to read generation data');
        }

        // Buscar todos os inversores do cliente
        const allInverters = await this.inverterRepository.find();
        const clientInverters = allInverters.filter(
            inv => !userContext.clientId || inv.clientId === userContext.clientId
        );

        if (clientInverters.length === 0) {
            return this.createEmptyResponse(request);
        }

        // Determinar quais inversores filtrar
        const targetInverterIds = request?.inverterIds && request.inverterIds.length > 0
            ? request.inverterIds.filter(id => clientInverters.some(inv => inv.id === id))
            : clientInverters.map(inv => inv.id);

        if (targetInverterIds.length === 0) {
            return this.createEmptyResponse(request);
        }

        // Buscar generation units de todos os inversores selecionados
        const allUnitsPromises = targetInverterIds.map(inverterId =>
            this.generationUnitRepository.findByInverterId(inverterId)
        );
        const allUnitsArrays = await Promise.all(allUnitsPromises);
        let allUnits = allUnitsArrays.flat();

        // Aplicar filtros
        if (request?.generationUnitType) {
            allUnits = allUnits.filter(unit => unit.generationUnitType === request.generationUnitType);
        }

        if (request?.startDate) {
            const startDate = new Date(request.startDate);
            allUnits = allUnits.filter(unit => new Date(unit.timestamp) >= startDate);
        }

        if (request?.endDate) {
            const endDate = new Date(request.endDate);
            allUnits = allUnits.filter(unit => new Date(unit.timestamp) <= endDate);
        }

        // Calcular métricas gerais
        const totalEnergy = allUnits.reduce((sum, unit) => sum + unit.energy, 0);
        const totalPower = allUnits.reduce((sum, unit) => sum + unit.power, 0);
        const averageEnergy = allUnits.length > 0 ? totalEnergy / allUnits.length : 0;
        const averagePower = allUnits.length > 0 ? totalPower / allUnits.length : 0;

        const peakPowerUnit = allUnits.reduce((max, unit) =>
            unit.power > max.power ? unit : max,
            allUnits[0] || { power: 0, timestamp: new Date() }
        );

        // Calcular inversores ativos (com dados no período)
        const activeInverterIds = new Set(allUnits.map(unit => unit.inverterId));

        // Criar série temporal agregada
        const timeSeriesMap = new Map<string, { energy: number; power: number; inverters: Set<string> }>();

        allUnits.forEach(unit => {
            const timeKey = unit.timestamp.toISOString();
            const existing = timeSeriesMap.get(timeKey) || { energy: 0, power: 0, inverters: new Set() };
            existing.energy += unit.energy;
            existing.power += unit.power;
            existing.inverters.add(unit.inverterId);
            timeSeriesMap.set(timeKey, existing);
        });

        const timeSeries = Array.from(timeSeriesMap.entries())
            .map(([timestamp, data]) => ({
                timestamp,
                energy: data.energy,
                power: data.power,
                inverterCount: data.inverters.size,
            }))
            .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

        // Calcular métricas por inversor
        const byInverter = targetInverterIds.map(inverterId => {
            const inverter = clientInverters.find(inv => inv.id === inverterId)!;
            const inverterUnits = allUnits.filter(unit => unit.inverterId === inverterId);

            const invTotalEnergy = inverterUnits.reduce((sum, unit) => sum + unit.energy, 0);
            const invTotalPower = inverterUnits.reduce((sum, unit) => sum + unit.power, 0);
            const invPeakPower = inverterUnits.reduce((max, unit) => Math.max(max, unit.power), 0);

            const lastUnit = inverterUnits.sort((a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )[0];

            return {
                inverterId: inverter.id,
                inverterName: inverter.name,
                provider: inverter.provider,
                totalEnergy: invTotalEnergy,
                totalPower: invTotalPower,
                averageEnergy: inverterUnits.length > 0 ? invTotalEnergy / inverterUnits.length : 0,
                averagePower: inverterUnits.length > 0 ? invTotalPower / inverterUnits.length : 0,
                peakPower: invPeakPower,
                dataPoints: inverterUnits.length,
                lastUpdate: lastUnit?.timestamp.toISOString(),
            };
        });

        // Calcular métricas por tipo
        const byType: any = {};
        const types: GenerationUnitType[] = ['real_time', 'day', 'month', 'year'];

        types.forEach(type => {
            const typeUnits = allUnits.filter(unit => unit.generationUnitType === type);
            if (typeUnits.length > 0) {
                byType[type] = {
                    totalEnergy: typeUnits.reduce((sum, unit) => sum + unit.energy, 0),
                    totalPower: typeUnits.reduce((sum, unit) => sum + unit.power, 0),
                    dataPoints: typeUnits.length,
                };
            }
        });

        // Calcular comparação com período anterior (se houver filtro de data)
        let comparison: any = undefined;
        if (request?.startDate && request?.endDate) {
            const start = new Date(request.startDate);
            const end = new Date(request.endDate);
            const periodDuration = end.getTime() - start.getTime();

            const previousStart = new Date(start.getTime() - periodDuration);
            const previousEnd = start;

            const previousUnitsPromises = targetInverterIds.map(inverterId =>
                this.generationUnitRepository.findByInverterId(inverterId)
            );
            const previousUnitsArrays = await Promise.all(previousUnitsPromises);
            let previousUnits = previousUnitsArrays.flat();

            previousUnits = previousUnits.filter(unit => {
                const timestamp = new Date(unit.timestamp);
                return timestamp >= previousStart && timestamp < previousEnd;
            });

            if (request?.generationUnitType) {
                previousUnits = previousUnits.filter(unit => unit.generationUnitType === request.generationUnitType);
            }

            const previousTotalEnergy = previousUnits.reduce((sum, unit) => sum + unit.energy, 0);
            const previousTotalPower = previousUnits.reduce((sum, unit) => sum + unit.power, 0);

            const energyChange = previousTotalEnergy > 0
                ? ((totalEnergy - previousTotalEnergy) / previousTotalEnergy) * 100
                : 0;
            const powerChange = previousTotalPower > 0
                ? ((totalPower - previousTotalPower) / previousTotalPower) * 100
                : 0;

            comparison = {
                previousPeriod: {
                    totalEnergy: previousTotalEnergy,
                    totalPower: previousTotalPower,
                    dataPoints: previousUnits.length,
                },
                percentageChange: {
                    energy: energyChange,
                    power: powerChange,
                },
            };
        }

        // Contar filtros aplicados
        const appliedFilters = [
            request?.generationUnitType,
            request?.inverterIds && request.inverterIds.length > 0,
            request?.startDate,
            request?.endDate,
        ].filter(Boolean).length;

        return GetDashboardAnalyticsResponseSchema.parse({
            overview: {
                totalEnergy,
                totalPower,
                averageEnergy,
                averagePower,
                peakPower: peakPowerUnit.power,
                peakPowerTimestamp: peakPowerUnit.timestamp?.toISOString(),
                totalInverters: targetInverterIds.length,
                activeInverters: activeInverterIds.size,
                totalDataPoints: allUnits.length,
            },
            timeSeries,
            byInverter,
            byType,
            comparison,
            filters: {
                generationUnitType: request?.generationUnitType,
                inverterIds: request?.inverterIds,
                startDate: request?.startDate,
                endDate: request?.endDate,
                appliedFilters,
            },
        });
    }

    private createEmptyResponse(request?: GetDashboardAnalyticsRequest): GetDashboardAnalyticsResponse {
        const appliedFilters = [
            request?.generationUnitType,
            request?.inverterIds && request.inverterIds.length > 0,
            request?.startDate,
            request?.endDate,
        ].filter(Boolean).length;

        return {
            overview: {
                totalEnergy: 0,
                totalPower: 0,
                averageEnergy: 0,
                averagePower: 0,
                peakPower: 0,
                totalInverters: 0,
                activeInverters: 0,
                totalDataPoints: 0,
            },
            timeSeries: [],
            byInverter: [],
            byType: {},
            filters: {
                generationUnitType: request?.generationUnitType,
                inverterIds: request?.inverterIds,
                startDate: request?.startDate,
                endDate: request?.endDate,
                appliedFilters,
            },
        };
    }
}
