// A API grava a validade no fuso de Brasília (00:00 / 23:59:59 -03:00); registros
// antigos/seed vêm só com a data (meia-noite UTC). Formatar no fuso do navegador
// mostrava esses como o dia anterior.
function offerTimeZone(date: Date): string {
    const utcMidnight = date.getUTCHours() === 0 && date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0;
    return utcMidnight ? 'UTC' : 'America/Sao_Paulo';
}

/** Dia da validade da oferta em pt-BR (DD/MM/AAAA). */
export function formatOfferDay(value: Date | string): string {
    const date = new Date(value);
    return date.toLocaleDateString('pt-BR', { timeZone: offerTimeZone(date) });
}

/** Dia da validade no formato do input type="date" (AAAA-MM-DD). */
export function offerDateInput(value?: Date | string | null): string {
    if (!value) return '';
    const date = new Date(value);
    return date.toLocaleDateString('en-CA', { timeZone: offerTimeZone(date) });
}
