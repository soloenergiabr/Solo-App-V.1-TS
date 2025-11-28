import { NextRequest, NextResponse } from 'next/server';
import { ClubService } from '@/backend/club/services/club.service';
import { PrismaIndicationRepository } from '@/backend/club/repositories/implementations/prisma.indication.repository';
import { PrismaTransactionRepository } from '@/backend/club/repositories/implementations/prisma.transaction.repository';
import { withHandle } from '@/app/api/api-utils';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { clubService } from '@/backend/club/services';

// Schema de validação para buscar indicações
const GetIndicationsRequestSchema = z.object({
    type: z.enum(['as_referrer', 'as_referred']).optional().default('as_referrer'),
});

const getIndicationsRoute = async (request: NextRequest): Promise<NextResponse> => {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'as_referrer' | 'as_referred' | null;

    // Validar parâmetros
    const validatedRequest = GetIndicationsRequestSchema.parse({ type });

    const userContext = await AuthMiddleware.extractUserContext(request);

    // Buscar indicações
    const result = await clubService.getIndications(validatedRequest, userContext);

    return NextResponse.json({
        success: true,
        data: result.indications,
    });
};

export const GET = withHandle(getIndicationsRoute);
