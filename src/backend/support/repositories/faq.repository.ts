import { FAQModel } from "../models/faq.model";

export interface FAQRepository {
    create(faq: FAQModel): Promise<void>;
    update(faq: FAQModel): Promise<void>;
    delete(id: string): Promise<void>;
    findById(id: string): Promise<FAQModel | null>;
    findAll(): Promise<FAQModel[]>;
    findActive(): Promise<FAQModel[]>;
}
