import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { PrismaUserRepository } from '@/backend/auth/repositories/prisma-user.repository';
import { PrismaTransactionRepository } from '@/backend/club/repositories/implementations/prisma.transaction.repository';
import { PrismaIndicationRepository } from '@/backend/club/repositories/implementations/prisma.indication.repository';
import { PrismaOfferRepository } from '@/backend/club/repositories/implementations/prisma.offer.repository';
import { PrismaInverterRepository } from '@/backend/generation/repositories/implementations/prisma.inverter.repository';
import { ClubService } from '@/backend/club/services/club.service';
import prisma from '@/lib/prisma';
import { PrismaClientRepository } from '@/backend/club/repositories/implementations/prisma.client.repository';

// Instantiate repositories
const userRepository = new PrismaUserRepository(prisma);
const clientRepository = new PrismaClientRepository(prisma);
const transactionRepository = new PrismaTransactionRepository(prisma);
const indicationRepository = new PrismaIndicationRepository(prisma);
const offerRepository = new PrismaOfferRepository(prisma);
const inverterRepository = new PrismaInverterRepository(prisma);

// Instantiate services
const clubService = new ClubService(indicationRepository, transactionRepository, offerRepository);

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify authentication and master role
        const userContext = await AuthMiddleware.extractUserContext(request);
        // TODO: Explicit master role check if not handled by middleware/layout

        const clientId = params.id;

        // Fetch data in parallel
        const [client, user, balance, inverters] = await Promise.all([
            clientRepository.findById(clientId),
            userRepository.findById(clientId),
            clubService.getClientBalance({ clientId } as any), // Constructing minimal UserContext
            inverterRepository.findByClientId(clientId),
        ]);

        if (!client) {
            return NextResponse.json(
                { success: false, message: 'Cliente não encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                client,
                user,
                balance,
                inverters,
            },
        });
    } catch (error: any) {
        console.error('Error fetching client details:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to fetch client details' },
            { status: 500 }
        );
    }
}
