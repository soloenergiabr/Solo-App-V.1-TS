import { NextRequest, NextResponse } from 'next/server';
import { withHandle } from '@/app/api/api-utils';
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

const getClientDetails = async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    const userContext = await AuthMiddleware.extractUserContext(request);
    // TODO: Explicit master role check

    const clientId = params.id;

    const [client, balance, inverters] = await Promise.all([
        clientRepository.findById(clientId),
        clubService.getClientBalance({ clientId } as any),
        inverterRepository.findByClientId(clientId),
    ]);

    if (!client) {
        throw new Error('Cliente não encontrado');
    }

    return NextResponse.json({
        success: true,
        data: {
            client,
            balance,
            inverters,
        },
    });
};

const updateClient = async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    const userContext = await AuthMiddleware.extractUserContext(request);
    // TODO: Explicit master role check

    const clientId = params.id;
    const body = await request.json();

    const existingClient = await clientRepository.findById(clientId);
    if (!existingClient) {
        throw new Error('Cliente não encontrado');
    }

    // Update fields
    existingClient.name = body.name || existingClient.name;
    existingClient.email = body.email || existingClient.email;
    existingClient.phone = body.phone || existingClient.phone;
    existingClient.status = body.status || existingClient.status;

    await clientRepository.update(existingClient);

    return NextResponse.json({
        success: true,
        message: 'Cliente atualizado com sucesso',
        data: existingClient,
    });
};

const deleteClient = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    const userContext = await AuthMiddleware.extractUserContext(request);
    // TODO: Explicit master role check

    const clientId = (await params).id;

    const existingClient = await clientRepository.findById(clientId);
    if (!existingClient) {
        throw new Error('Cliente não encontrado');
    }

    if (existingClient.status === 'inactive') {
        // If already inactive, perform hard delete
        await clientRepository.hardDelete(clientId);
        return NextResponse.json({
            success: true,
            message: 'Cliente excluído permanentemente',
        });
    } else {
        // If active, perform soft delete (deactivate)
        await clientRepository.delete(clientId);
        return NextResponse.json({
            success: true,
            message: 'Cliente desativado com sucesso',
        });
    }
};

export const GET = withHandle(getClientDetails);
export const PUT = withHandle(updateClient);
export const DELETE = withHandle(deleteClient);
