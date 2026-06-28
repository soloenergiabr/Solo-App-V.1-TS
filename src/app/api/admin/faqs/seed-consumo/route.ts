import { NextRequest, NextResponse } from 'next/server';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { PrismaFAQRepository } from '@/backend/support/repositories/implementations/prisma-faq.repository';
import { FAQService } from '@/backend/support/services/faq.service';
import { seedConsumoFaqsIfEmpty } from '@/backend/support/seed-default-faqs';
import prisma from '@/lib/prisma';

// Instantiate dependencies
const faqRepository = new PrismaFAQRepository(prisma);
const faqService = new FAQService(faqRepository);

const seedConsumo = async (request: NextRequest) => {
    // Verify authentication (admin/master)
    await AuthMiddleware.extractUserContext(request);

    const { created } = await seedConsumoFaqsIfEmpty(faqService);

    return NextResponse.json({
        success: true,
        data: { created },
    });
};

export const POST = withHandle(seedConsumo);
