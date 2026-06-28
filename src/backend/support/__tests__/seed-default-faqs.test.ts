import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    seedConsumoFaqsIfEmpty,
    DEFAULT_CONSUMO_FAQS,
} from '../seed-default-faqs';
import { FAQService } from '../services/faq.service';
import { FAQRepository } from '../repositories/faq.repository';
import { FAQModel } from '../models/faq.model';

const mockRepository = (): FAQRepository => ({
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    findActive: vi.fn(),
});

describe('seedConsumoFaqsIfEmpty', () => {
    let service: FAQService;
    let repo: FAQRepository;

    beforeEach(() => {
        repo = mockRepository();
        service = new FAQService(repo);
        vi.clearAllMocks();
    });

    it('seeds all 4 default FAQs when consumo category is empty', async () => {
        vi.mocked(repo.findActive).mockResolvedValue([]);
        vi.mocked(repo.create).mockResolvedValue(undefined);

        const result = await seedConsumoFaqsIfEmpty(service);

        expect(result.created).toBe(4);
        expect(repo.create).toHaveBeenCalledTimes(4);
    });

    it('skips seeding when consumo FAQs already exist (idempotent)', async () => {
        const existingFAQ = new FAQModel({
            question: 'Existing',
            answer: 'Existing answer',
            category: 'consumo',
            isActive: true,
        });
        vi.mocked(repo.findActive).mockResolvedValue([existingFAQ]);

        const result = await seedConsumoFaqsIfEmpty(service);

        expect(result.created).toBe(0);
        expect(repo.create).not.toHaveBeenCalled();
    });

    it('calling twice only creates FAQs on the first call', async () => {
        // First call: empty
        vi.mocked(repo.findActive).mockResolvedValueOnce([]);
        vi.mocked(repo.create).mockResolvedValue(undefined);
        const first = await seedConsumoFaqsIfEmpty(service);

        // Second call: now has FAQs (simulate they were created)
        const seeded = DEFAULT_CONSUMO_FAQS.map(
            (f) => new FAQModel({ ...f, isActive: true })
        );
        vi.mocked(repo.findActive).mockResolvedValueOnce(seeded);
        const second = await seedConsumoFaqsIfEmpty(service);

        expect(first.created).toBe(4);
        expect(second.created).toBe(0);
        // create was only called 4 times total (first call only)
        expect(repo.create).toHaveBeenCalledTimes(4);
    });

    it('DEFAULT_CONSUMO_FAQS has exactly 4 entries all in consumo category', () => {
        expect(DEFAULT_CONSUMO_FAQS).toHaveLength(4);
        DEFAULT_CONSUMO_FAQS.forEach((faq) => {
            expect(faq.category).toBe('consumo');
            expect(faq.isActive).toBe(true);
            expect(faq.question.length).toBeGreaterThan(0);
            expect(faq.answer.length).toBeGreaterThan(0);
        });
    });
});
