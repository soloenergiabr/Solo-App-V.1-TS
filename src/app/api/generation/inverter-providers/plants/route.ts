import { NextRequest, NextResponse } from 'next/server'
import { initializeGenerationDIContainer } from '@/backend/generation/infrastructure/dependency-injection.container'
import { InverterService } from '@/backend/generation/services/inverter.service'
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware'
import prisma from '@/lib/prisma'
import { ListProviderPlantsRequestSchema } from '@/backend/generation/use-cases'
import { ZodError } from 'zod'

const container = initializeGenerationDIContainer('prisma', prisma)
const inverterService = new InverterService(container.getInverterRepository())

export async function POST(request: NextRequest) {
    try {
        await AuthMiddleware.requirePermission(request, 'read_inverters')

        const body = await request.json()
        const validatedRequest = ListProviderPlantsRequestSchema.parse(body)

        const result = await inverterService.listProviderPlants(validatedRequest)

        return NextResponse.json({
            success: true,
            data: result.plants,
            count: result.plants.length
        })
    } catch (error) {
        console.error('Error listing provider plants:', error)

        if (error instanceof ZodError) {
            return NextResponse.json({
                success: false,
                error: 'Validation error',
                message: 'Invalid request data',
                details: error.issues
            }, { status: 400 })
        }

        if (error instanceof Error && (error.message.includes('permission') || error.message.includes('token'))) {
            const status = error.message.includes('token') ? 401 : 403
            return NextResponse.json({
                success: false,
                error: 'Authorization failed',
                message: error.message
            }, { status })
        }

        return NextResponse.json({
            success: false,
            error: 'Failed to list provider plants',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
