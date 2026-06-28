import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FAQService } from '../faq.service';
import { FAQRepository } from '../../repositories/faq.repository';
import { FAQModel } from '../../models/faq.model';

const makeFAQ = (overrides: Partial<FAQModel> = {}): FAQModel =>
    new FAQModel({
        question: 'Q',
        answer: 'A',
        isActive: true,
        ...overrides,
    });

const mockRepository = (): FAQRepository => ({
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    findActive: vi.fn(),
});

describe('FAQService.getActiveFAQsByCategory', () => {
    let service: FAQService;
    let repo: FAQRepository;

    beforeEach(() => {
        repo = mockRepository();
        service = new FAQService(repo);
    });

    it('returns only FAQs matching the requested category', async () => {
        const consumoFaq = makeFAQ({ category: 'consumo', question: 'Q consumo' });
        const geracaoFaq = makeFAQ({ category: 'geracao', question: 'Q geracao' });
        const noCategoryFaq = makeFAQ({ question: 'Q none' });

        vi.mocked(repo.findActive).mockResolvedValue([consumoFaq, geracaoFaq, noCategoryFaq]);

        const result = await service.getActiveFAQsByCategory('consumo');

        expect(result).toHaveLength(1);
        expect(result[0].question).toBe('Q consumo');
    });

    it('returns empty array when no FAQs match the category', async () => {
        const geracaoFaq = makeFAQ({ category: 'geracao' });
        vi.mocked(repo.findActive).mockResolvedValue([geracaoFaq]);

        const result = await service.getActiveFAQsByCategory('consumo');

        expect(result).toHaveLength(0);
    });

    it('getActiveFAQs still returns all active FAQs (no category filter)', async () => {
        const faq1 = makeFAQ({ category: 'consumo' });
        const faq2 = makeFAQ({ category: 'geracao' });
        vi.mocked(repo.findActive).mockResolvedValue([faq1, faq2]);

        const result = await service.getActiveFAQs();

        expect(result).toHaveLength(2);
    });
});
