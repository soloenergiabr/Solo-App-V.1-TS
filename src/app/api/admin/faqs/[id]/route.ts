import { NextRequest, NextResponse } from 'next/server';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { PrismaFAQRepository } from '@/backend/support/repositories/implementations/prisma-faq.repository';
import { FAQService } from '@/backend/support/services/faq.service';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Instantiate dependencies
const faqRepository = new PrismaFAQRepository(prisma);
const faqService = new FAQService(faqRepository);

const updateFAQSchema = z.object({
    question: z.string().min(1, 'Question is required').optional(),
    answer: z.string().min(1, 'Answer is required').optional(),
    category: z.string().optional(),
    isActive: z.boolean().optional(),
});

const updateFAQ = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    const userContext = await AuthMiddleware.extractUserContext(request);
    // TODO: Explicit master role check

    const faqId = (await params).id;
    const body = await request.json();
    const validatedData = updateFAQSchema.parse(body);

    const updatedFAQ = await faqService.updateFAQ(faqId, validatedData);

    return NextResponse.json({
        success: true,
        message: 'FAQ updated successfully',
        data: updatedFAQ,
    });
};

const deleteFAQ = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    const userContext = await AuthMiddleware.extractUserContext(request);
    // TODO: Explicit master role check

    const faqId = (await params).id;

    await faqService.deleteFAQ(faqId);

    return NextResponse.json({
        success: true,
        message: 'FAQ deleted successfully',
    });
};

export const PUT = withHandle(updateFAQ);
export const DELETE = withHandle(deleteFAQ);
