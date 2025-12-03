import { FAQModel } from "../models/faq.model";
import { FAQRepository } from "../repositories/faq.repository";

export class FAQService {
    constructor(private faqRepository: FAQRepository) { }

    async createFAQ(data: Partial<FAQModel>): Promise<FAQModel> {
        if (!data.question || !data.answer) {
            throw new Error('Question and Answer are required');
        }

        const faq = new FAQModel({
            question: data.question,
            answer: data.answer,
            category: data.category,
            isActive: data.isActive ?? true,
        });

        await this.faqRepository.create(faq);
        return faq;
    }

    async updateFAQ(id: string, data: Partial<FAQModel>): Promise<FAQModel> {
        const existingFAQ = await this.faqRepository.findById(id);
        if (!existingFAQ) {
            throw new Error('FAQ not found');
        }

        existingFAQ.question = data.question || existingFAQ.question;
        existingFAQ.answer = data.answer || existingFAQ.answer;
        existingFAQ.category = data.category !== undefined ? data.category : existingFAQ.category;
        existingFAQ.isActive = data.isActive !== undefined ? data.isActive : existingFAQ.isActive;

        await this.faqRepository.update(existingFAQ);
        return existingFAQ;
    }

    async deleteFAQ(id: string): Promise<void> {
        const existingFAQ = await this.faqRepository.findById(id);
        if (!existingFAQ) {
            throw new Error('FAQ not found');
        }
        await this.faqRepository.delete(id);
    }

    async getFAQById(id: string): Promise<FAQModel | null> {
        return await this.faqRepository.findById(id);
    }

    async getAllFAQs(): Promise<FAQModel[]> {
        return await this.faqRepository.findAll();
    }

    async getActiveFAQs(): Promise<FAQModel[]> {
        return await this.faqRepository.findActive();
    }
}
