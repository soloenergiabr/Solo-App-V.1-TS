import { afterEach, describe, expect, it, vi } from 'vitest';
import { filterFaqs, supportWhatsAppUrl } from './support-links';

describe('supportWhatsAppUrl', () => {
    afterEach(() => vi.unstubAllEnvs());

    it('retorna null sem número configurado', () => {
        vi.stubEnv('NEXT_PUBLIC_SUPPORT_WHATSAPP', '');
        expect(supportWhatsAppUrl('oi')).toBeNull();
    });

    it('monta o link só com dígitos e mensagem codificada', () => {
        vi.stubEnv('NEXT_PUBLIC_SUPPORT_WHATSAPP', '+55 (85) 99999-9999');
        expect(supportWhatsAppUrl('Olá! Ajuda?')).toBe('https://wa.me/5585999999999?text=Ol%C3%A1!%20Ajuda%3F');
    });
});

describe('filterFaqs', () => {
    const faqs = [
        { question: 'Como funciona a compensação?', answer: 'Os créditos são abatidos na conta.' },
        { question: 'Posso cancelar?', answer: 'Sim, a qualquer momento.' },
    ];

    it('devolve tudo com busca vazia', () => {
        expect(filterFaqs(faqs, '  ')).toEqual(faqs);
    });

    it('ignora acentos e maiúsculas, na pergunta e na resposta', () => {
        expect(filterFaqs(faqs, 'COMPENSACAO')).toEqual([faqs[0]]);
        expect(filterFaqs(faqs, 'creditos conta')).toEqual([faqs[0]]);
        expect(filterFaqs(faqs, 'momênto')).toEqual([faqs[1]]);
    });

    it('retorna vazio quando nada bate', () => {
        expect(filterFaqs(faqs, 'inversor')).toEqual([]);
    });
});
