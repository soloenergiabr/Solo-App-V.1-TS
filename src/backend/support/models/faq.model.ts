import { uuid } from "@/lib/uuid";

export class FAQModel {
    id: string;
    question: string;
    answer: string;
    category?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;

    constructor({
        id,
        question,
        answer,
        category,
        isActive,
        createdAt,
        updatedAt
    }: {
        id?: string;
        question: string;
        answer: string;
        category?: string;
        isActive?: boolean;
        createdAt?: Date;
        updatedAt?: Date;
    }) {
        this.id = id || `faq_${uuid()}`;
        this.question = question;
        this.answer = answer;
        this.category = category;
        this.isActive = isActive ?? true;
        this.createdAt = createdAt || new Date();
        this.updatedAt = updatedAt || new Date();
    }
}
