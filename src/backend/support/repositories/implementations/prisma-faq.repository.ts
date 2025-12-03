import { PrismaClient } from "@/app/generated/prisma";
import { FAQModel } from "../../models/faq.model";
import { FAQRepository } from "../faq.repository";

export class PrismaFAQRepository implements FAQRepository {
    constructor(private prisma: PrismaClient) { }

    async create(faq: FAQModel): Promise<void> {
        await this.prisma.fAQ.create({
            data: {
                id: faq.id,
                question: faq.question,
                answer: faq.answer,
                category: faq.category,
                isActive: faq.isActive,
                createdAt: faq.createdAt,
                updatedAt: faq.updatedAt,
            },
        });
    }

    async update(faq: FAQModel): Promise<void> {
        await this.prisma.fAQ.update({
            where: { id: faq.id },
            data: {
                question: faq.question,
                answer: faq.answer,
                category: faq.category,
                isActive: faq.isActive,
                updatedAt: new Date(),
            },
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.fAQ.delete({
            where: { id },
        });
    }

    async findById(id: string): Promise<FAQModel | null> {
        const faq = await this.prisma.fAQ.findUnique({
            where: { id },
        });

        if (!faq) return null;

        return new FAQModel({
            id: faq.id,
            question: faq.question,
            answer: faq.answer,
            category: faq.category || undefined,
            isActive: faq.isActive,
            createdAt: faq.createdAt,
            updatedAt: faq.updatedAt,
        });
    }

    async findAll(): Promise<FAQModel[]> {
        const faqs = await this.prisma.fAQ.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return faqs.map(faq => new FAQModel({
            id: faq.id,
            question: faq.question,
            answer: faq.answer,
            category: faq.category || undefined,
            isActive: faq.isActive,
            createdAt: faq.createdAt,
            updatedAt: faq.updatedAt,
        }));
    }

    async findActive(): Promise<FAQModel[]> {
        const faqs = await this.prisma.fAQ.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });

        return faqs.map(faq => new FAQModel({
            id: faq.id,
            question: faq.question,
            answer: faq.answer,
            category: faq.category || undefined,
            isActive: faq.isActive,
            createdAt: faq.createdAt,
            updatedAt: faq.updatedAt,
        }));
    }
}
