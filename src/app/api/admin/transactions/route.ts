import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { PrismaTransactionRepository } from '@/backend/club/repositories/implementations/prisma.transaction.repository';
import { TransactionService } from '@/backend/club/services/transaction.service';
import { TransactionModel } from '@/backend/club/models/transaction.model';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Instantiate dependencies
const transactionRepository = new PrismaTransactionRepository(prisma);
const transactionService = new TransactionService(transactionRepository);

const manualTransactionSchema = z.object({
    clientId: z.string().min(1, 'Client ID is required'),
    amount: z.number().refine(val => val !== 0, 'Amount must not be zero'),
    description: z.string().min(1, 'Description is required'),
});

import { withHandle } from '@/app/api/api-utils';

// ... (imports)

// ... (instantiations)

const createManualTransaction = async (request: NextRequest) => {
    // Verify authentication and master role
    const userContext = await AuthMiddleware.extractUserContext(request);
    // TODO: Explicit master role check

    const body = await request.json();
    const validatedData = manualTransactionSchema.parse(body);

    const transaction = new TransactionModel({
        clientId: validatedData.clientId,
        type: 'manual_adjustment', // Corrected type
        amount: validatedData.amount,
        description: validatedData.description,
    });

    await transactionService.createTransaction(transaction);

    return NextResponse.json({
        success: true,
        message: 'Transaction created successfully',
    });
};

export const POST = withHandle(createManualTransaction);
