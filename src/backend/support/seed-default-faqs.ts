import { FAQService } from './services/faq.service';

export const DEFAULT_CONSUMO_FAQS = [
    {
        question: 'O que é o saldo SCEE?',
        answer: 'É o Sistema de Compensação de Energia Elétrica: os créditos que sua usina injetou e que abatem seu consumo nos próximos meses.',
        category: 'consumo',
        isActive: true,
    },
    {
        question: 'Por que ainda pago a taxa mínima?',
        answer: 'Mesmo gerando energia, a distribuidora cobra um custo de disponibilidade (taxa mínima) por manter você conectado à rede.',
        category: 'consumo',
        isActive: true,
    },
    {
        question: 'O que é a bandeira tarifária?',
        answer: 'Um adicional na tarifa que varia conforme o custo de geração do país: verde (sem adicional), amarela e vermelha (adicionais crescentes).',
        category: 'consumo',
        isActive: true,
    },
    {
        question: 'O que significa kWh?',
        answer: 'Quilowatt-hora é a unidade que mede a energia consumida — é o que a distribuidora cobra na sua conta.',
        category: 'consumo',
        isActive: true,
    },
] as const;

/**
 * Idempotent: only seeds when the consumo category is currently empty.
 */
export async function seedConsumoFaqsIfEmpty(
    service: FAQService
): Promise<{ created: number }> {
    const existing = await service.getActiveFAQsByCategory('consumo');
    if (existing.length > 0) return { created: 0 };

    for (const faq of DEFAULT_CONSUMO_FAQS) {
        await service.createFAQ(faq);
    }

    return { created: DEFAULT_CONSUMO_FAQS.length };
}
