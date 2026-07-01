import { NextRequest, NextResponse } from 'next/server'
import { withHandle } from '@/app/api/api-utils'
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware'
import { GenerationService } from '@/backend/generation/services/generation.service'
import { PrismaInverterRepository } from '@/backend/generation/repositories/implementations/prisma.inverter.repository'
import { PrismaGenerationUnitRepository } from '@/backend/generation/repositories/implementations/prisma.generation-unit.repository'
import prisma from '@/lib/prisma'

const generationService = new GenerationService(
  new PrismaInverterRepository(prisma),
  new PrismaGenerationUnitRepository(prisma),
)

const syncClientInverters = async (request: NextRequest) => {
  const user = await AuthMiddleware.requireAuth(request)
  const url = new URL(request.url)
  const clientId = (user.hasRole?.('master') && url.searchParams.get('clientId')) || user.clientId
  if (!clientId) throw new Error('Usuário sem cliente vinculado')

  const result = await generationService.syncClientInvertersData(clientId)
  if (result.results.length === 0 && result.errors.length > 0) {
    return NextResponse.json({
      success: false,
      message: 'Falha ao sincronizar dados dos inversores. Verifique as credenciais de API.',
      data: result,
    })
  }

  return NextResponse.json({ success: true, data: result })
}

export const POST = withHandle(syncClientInverters)
