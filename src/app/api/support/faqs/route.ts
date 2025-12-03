import { NextRequest, NextResponse } from 'next/server';
import { withHandle } from '@/app/api/api-utils';
import { PrismaFAQRepository } from '@/backend/support/repositories/implementations/prisma-faq.repository';
import { FAQService } from '@/backend/support/services/faq.service';
import prisma from '@/lib/prisma';

// Instantiate dependencies
const faqRepository = new PrismaFAQRepository(prisma);
const faqService = new FAQService(faqRepository);

const getActiveFAQs = async (request: NextRequest) => {
    // Public route, no auth required or optional auth

    const faqs = await faqService.getActiveFAQs();

    return NextResponse.json({
        success: true,
        data: faqs,
    });
};

export const GET = withHandle(getActiveFAQs);
