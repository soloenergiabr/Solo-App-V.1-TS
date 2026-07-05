import { GenerationService } from "./services/generation.service"
import { PrismaInverterRepository } from "./repositories/implementations/prisma.inverter.repository"
import { PrismaGenerationUnitRepository } from "./repositories/implementations/prisma.generation-unit.repository"
import prisma from "@/lib/prisma"

const DEFAULT_INTERVAL_MINUTES = 15
let schedulerHandle: ReturnType<typeof setInterval> | undefined

type SyncAllInvertersResult = Awaited<ReturnType<GenerationService["syncAllInvertersData"]>>
type SyncAllInvertersFn = () => Promise<SyncAllInvertersResult>

function resolveIntervalMinutes(rawValue: string): number {
    const parsed = Number(rawValue)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_INTERVAL_MINUTES
}

function summarizeFailuresByProvider(errors: SyncAllInvertersResult["errors"]): Record<string, number> {
    return errors.reduce<Record<string, number>>((summary, error) => {
        const provider = (error as { provider?: string }).provider ?? "desconhecido"
        summary[provider] = (summary[provider] ?? 0) + 1
        return summary
    }, {})
}

async function runSyncCycle(syncAllInvertersData: SyncAllInvertersFn): Promise<void> {
    try {
        const { results, errors } = await syncAllInvertersData()
        console.log(
            `[generation-sync-scheduler] ciclo concluído: ${results.length} inversores sincronizados, ${errors.length} falhas`,
            summarizeFailuresByProvider(errors)
        )
    } catch (error) {
        console.error("[generation-sync-scheduler] ciclo falhou:", error)
    }
}

function defaultSyncAllInvertersData(): Promise<SyncAllInvertersResult> {
    const generationService = new GenerationService(
        new PrismaInverterRepository(prisma),
        new PrismaGenerationUnitRepository(prisma)
    )

    return generationService.syncAllInvertersData()
}

/**
 * Agenda a sincronização periódica (em processo) de todos os inversores de
 * todos os clientes, para que os dados de geração continuem avançando no
 * banco mesmo sem nenhum dashboard aberto.
 *
 * Só agenda quando GENERATION_SYNC_INTERVAL_MINUTES está definida no ambiente
 * — ausência da env significa "não agendar" (ativação explícita, tipicamente
 * só em produção). Quando definida mas não numérica/positiva, cai para o
 * intervalo padrão de 15 minutos.
 */
export function startGenerationSyncScheduler(
    syncAllInvertersData: SyncAllInvertersFn = defaultSyncAllInvertersData
): NodeJS.Timeout | undefined {
    if (schedulerHandle) {
        return schedulerHandle
    }

    const rawInterval = process.env.GENERATION_SYNC_INTERVAL_MINUTES
    if (!rawInterval) return undefined

    const intervalMs = resolveIntervalMinutes(rawInterval) * 60 * 1000

    schedulerHandle = setInterval(() => {
        void runSyncCycle(syncAllInvertersData)
    }, intervalMs)

    return schedulerHandle
}

export function resetGenerationSyncSchedulerForTests(): void {
    if (schedulerHandle) {
        clearInterval(schedulerHandle)
        schedulerHandle = undefined
    }
}
