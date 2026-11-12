// Número de WhatsApp do suporte (só dígitos, ex.: 5585999999999). Sem número, a opção some da UI.
export function supportWhatsAppUrl(message: string): string | null {
    const digits = (process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? '').replace(/\D/g, '');
    return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : null;
}

export const SUPPORT_WHATSAPP_MESSAGE = 'Olá! Sou cliente Solo e preciso de ajuda.';

const normalize = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

// Filtra FAQs por pergunta + resposta, ignorando acentos e maiúsculas.
export function filterFaqs<T extends { question: string; answer: string }>(faqs: T[], query: string): T[] {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    if (!terms.length) return faqs;
    return faqs.filter((f) => {
        const text = normalize(`${f.question} ${f.answer}`);
        return terms.every((t) => text.includes(t));
    });
}
