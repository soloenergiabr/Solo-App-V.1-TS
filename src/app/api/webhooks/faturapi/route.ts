import { NextRequest, NextResponse, after } from 'next/server';
import { verifyFaturapiSignature } from '@/backend/integrations/faturapi/faturapi-signature';
import { processFaturapiEvent, recordFaturapiEvent } from '@/backend/integrations/faturapi/faturapi-webhook.service';
import type { FaturapiWebhookEvent } from '@/backend/integrations/faturapi/faturapi.types';

export async function POST(request: NextRequest) {
    // A assinatura e calculada sobre o corpo bruto: ler como texto antes de qualquer parse.
    const rawBody = await request.text();

    const verification = verifyFaturapiSignature(
        rawBody,
        request.headers.get('faturapi-signature'),
        process.env.FATURAPI_WEBHOOK_SECRET,
    );
    if (!verification.ok) {
        console.warn(`[Faturapi] Webhook rejeitado: ${verification.reason}`);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    let event: FaturapiWebhookEvent;
    try {
        event = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const eventId = request.headers.get('faturapi-event-id') ?? event.id;
    if (!eventId || !event.type) {
        return NextResponse.json({ error: 'Missing event id or type' }, { status: 400 });
    }

    try {
        const isNew = await recordFaturapiEvent(eventId, event);
        // Faturapi exige 2xx em ate 10s: o processamento roda depois da resposta.
        if (isNew) after(() => processFaturapiEvent(eventId));
    } catch (error) {
        console.error('Error recording Faturapi webhook:', error);
        return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
