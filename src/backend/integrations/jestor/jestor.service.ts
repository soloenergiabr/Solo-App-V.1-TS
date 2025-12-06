import axios from 'axios';

export interface CreateLeadRequest {
    name: string;
    phone: string;
    email: string;
    description: string;
    who_referring: string;
    phone_who_referring: string;
    id_lead_soloapp: string;
}

export class JestorService {
    private webhookUrl: string;

    constructor() {
        this.webhookUrl = process.env.JESTOR_CREATE_LEAD_WEBHOOK_URL || '';
        if (!this.webhookUrl) {
            console.warn('JESTOR_CREATE_LEAD_WEBHOOK_URL is not defined in environment variables.');
        }
    }

    async createLead(data: CreateLeadRequest): Promise<void> {
        console.log(`[JestorService] Webhook URL: ${this.webhookUrl}`);
        if (!this.webhookUrl) {
            console.warn('Skipping Jestor lead creation: Webhook URL not configured.');
            return;
        }

        try {
            console.log('Sending lead to Jestor:', data);
            const response = await axios.post(this.webhookUrl, data);

            if (response.status >= 200 && response.status < 300) {
                console.log('✅ Jestor lead created successfully.');
            } else {
                console.warn(`⚠️ Jestor responded with status ${response.status}:`, response.data);
            }
        } catch (error: any) {
            console.error('❌ Error creating lead in Jestor:', error.message);
            if (error.response) {
                console.error('Jestor response data:', error.response.data);
            }
        }
    }
}
