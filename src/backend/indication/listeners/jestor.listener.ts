import { IndicationCreatedPayload } from '@/backend/shared/event-bus';

const JESTOR_WEBHOOK_URL = 'https://mateussmaia.api.jestor.com/webhook/ZjNkNDE0NGZlOTY2YzE5ee4dccd038MTc2Mjk1MDI4OTdlYjA2';

export const onIndicationCreatedToJestor = async (payload: IndicationCreatedPayload) => {
    try {
        const response = await fetch(JESTOR_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: payload.name,
                phone: payload.phone,
                email: payload.email,
                description: payload.description,
                who_referring: payload.whoReferring,
                phone_who_referring: payload.phoneWhoReferring,
                id_lead_soloapp: payload.idLeadSoloApp,
            }),
        });

        if (!response.ok) {
            console.error('Failed to send indication to Jestor:', await response.text());
        } else {
            console.log('Indication sent to Jestor successfully');
        }
    } catch (error) {
        console.error('Error sending indication to Jestor:', error);
    }
};
