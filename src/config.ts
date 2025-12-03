export const config = {
    jestor_create_lead_webhook_url: process.env.JESTOR_CREATE_LEAD_WEBHOOK_URL || undefined,
    base_url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
} as const