import { AuthMiddleware } from "@/backend/auth/middleware/auth.middleware"
import { GenerationService } from "@/backend/generation/services/generation.service"
import { NextRequest, NextResponse } from "next/server"
import { PrismaInverterRepository } from "@/backend/generation/repositories/implementations/prisma.inverter.repository"
import { PrismaGenerationUnitRepository } from "@/backend/generation/repositories/implementations/prisma.generation-unit.repository"
import prisma from "@/lib/prisma"
import { withHandle } from "@/app/api/api-utils"

const generationService = new GenerationService(
    new PrismaInverterRepository(prisma),
    new PrismaGenerationUnitRepository(prisma)
)

const SYNC_TOKEN_HEADER = "x-sync-token"

/**
 * Aceita OU um service-token válido (header x-sync-token == GENERATION_SYNC_TOKEN)
 * OU uma sessão autenticada com papel admin/master. Qualquer outra combinação
 * (token ausente, token inválido, sessão sem papel adequado) é rejeitada.
 *
 * Se GENERATION_SYNC_TOKEN não estiver configurada, o caminho por token nunca
 * autoriza — nenhuma env = nenhuma porta aberta.
 */
async function authorizeSync(request: NextRequest): Promise<void> {
    const providedToken = request.headers.get(SYNC_TOKEN_HEADER)
    const expectedToken = process.env.GENERATION_SYNC_TOKEN

    if (expectedToken && providedToken === expectedToken) {
        return
    }

    try {
        const user = await AuthMiddleware.requireAuth(request)
        if (user.hasRole('admin') || user.hasRole('master')) {
            return
        }
    } catch {
        // sem sessão válida — cai para o erro de autorização abaixo
    }

    throw new Error('Sincronização não autorizada: token inválido ou ausente')
}

const syncAllInvertersData = async (req: NextRequest) => {
    await authorizeSync(req)

    const result = await generationService.syncAllInvertersData()

    return NextResponse.json(result)
}

export const POST = withHandle(syncAllInvertersData)