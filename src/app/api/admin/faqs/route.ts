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

const createFAQSchema = z.object({
    question: z.string().min(1, 'Question is required'),
    answer: z.string().min(1, 'Answer is required'),
    category: z.string().optional(),
    isActive: z.boolean().optional(),
});

const getFAQs = async (request: NextRequest) => {
    // Verify authentication and master role
    const userContext = await AuthMiddleware.extractUserContext(request);
    // TODO: Explicit master role check

    const faqs = await faqService.getAllFAQs();

    return NextResponse.json({
        success: true,
        data: faqs,
    });
};

const createFAQ = async (request: NextRequest) => {
    const userContext = await AuthMiddleware.extractUserContext(request);
    // TODO: Explicit master role check

    const body = await request.json();
    const validatedData = createFAQSchema.parse(body);

    const newFAQ = await faqService.createFAQ(validatedData);

    return NextResponse.json({
        success: true,
        message: 'FAQ created successfully',
        data: newFAQ,
    });
};

export const GET = withHandle(getFAQs);
export const POST = withHandle(createFAQ);
