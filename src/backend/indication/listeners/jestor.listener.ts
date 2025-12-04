import { IndicationCreatedPayload } from '@/backend/shared/event-bus';
import { config } from '@/config';


export const onIndicationCreatedToJestor = async (payload: IndicationCreatedPayload) => {
    try {
        if (!config.jestor_create_lead_webhook_url) {
            console.error('Jestor webhook URL is not configured');
            return;
        }

        const response = await fetch(config.jestor_create_lead_webhook_url, {
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
