import { createHash, createHmac } from "node:crypto"
import { InverterModel } from "../../models/inverter.model"
import { InverterApiRepository } from "../inverter-api.repository"

export class SolisInverterApiRepository extends InverterApiRepository {
    constructor(data: InverterModel) { super(data) }

    async getRealTimeGeneration(): Promise<{ power: number, energy: number }> {
        const resource = '/v1/api/inverterDetail';
        const body = { id: this.data.providerId };

        const headers = this.getRequestHeaders(this.data, {
            body: body,
            verb: 'POST',
            contentType: 'application/json',
            canonicalizedResource: resource
        })

        const response = await fetch(`${this.data.providerUrl}${resource}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        })

        if (!response.ok) {
            throw new Error('Failed to fetch real-time generation data')
        }

        const { data } = await response.json()
        const totalPower = data.pac || 0
        const energyToday = data.eToday || 0

        return Promise.resolve({ power: totalPower, energy: energyToday })
    }
    getGenerationByDay(): Promise<number> {
        return Promise.resolve(1)
    }
    getGenerationByMonth(): Promise<number> {
        return Promise.resolve(1)
    }
    getGenerationByYear(): Promise<number> {
        return Promise.resolve(1)
    }
    getGenerationByInterval(): Promise<number> {
        return Promise.resolve(1)
    }

    private getRequestHeaders(inverter: InverterModel, { body, verb, contentType, canonicalizedResource }: { body: any, verb: string, contentType: string, canonicalizedResource: string }) {
        if (!inverter.providerApiSecret) {
            throw new Error("Inverter API secret not found")
        }

        const gmtTime = new Date().toUTCString()

        const calculateContentMD5 = (body: any): string => {
            if (!body) return '';
            const md5Hash = createHash('md5').update(body).digest();
            return md5Hash.toString('base64');
        }

        const generateSignature = (verb: string, contentMD5: string, contentType: string, date: string, canonicalizedResource: string): string => {
            const stringToSign = `${verb}\n${contentMD5}\n${contentType}\n${date}\n${canonicalizedResource}`;
            const hmac = createHmac('sha1', inverter.providerApiSecret!);
            hmac.update(stringToSign);
            return hmac.digest('base64');
        }


        const bodyStr = typeof body === 'object' ? JSON.stringify(body) : body || '';

        const date = gmtTime;
        const contentMD5 = calculateContentMD5(bodyStr);
        const signature = generateSignature(verb, contentMD5, contentType, date, canonicalizedResource);
        const authorization = `API ${inverter.providerApiKey}:${signature}`;

        return {
            'Content-MD5': contentMD5,
            'Content-Type': contentType,
            'Date': date,
            'Authorization': authorization
        };
    }
}