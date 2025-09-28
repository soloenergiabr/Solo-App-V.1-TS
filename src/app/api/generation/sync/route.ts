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

const syncAllInvertersData = async (req: NextRequest) => {
    const userContext = await AuthMiddleware.requireAuth(req)

    const result = await generationService.syncAllInvertersData(userContext)

    return NextResponse.json(result)
}

export const POST = withHandle(syncAllInvertersData)