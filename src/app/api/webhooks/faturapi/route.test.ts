import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { computeFaturapiSignature } from '@/backend/integrations/faturapi/faturapi-signature'

const mockRecord = vi.fn()
const mockProcess = vi.fn()
const afterCallbacks: Array<() => unknown> = []

vi.mock('@/backend/integrations/faturapi/faturapi-webhook.service', () => ({
    recordFaturapiEvent: mockRecord,
    processFaturapiEvent: mockProcess,
}))

vi.mock('next/server', async (importOriginal) => {
    const actual = await importOriginal<typeof import('next/server')>()
    return { ...actual, after: (cb: () => unknown) => { afterCallbacks.push(cb) } }
})

const { POST } = await import('./route')

const SECRET = 'whsec_route_test'
const EVENT = { id: 'evt_123', type: 'invoice.received', createdAt: '2026-10-25T12:00:00Z', data: {} }
const BODY = JSON.stringify(EVENT)

function makeRequest(body: string, signature?: string, eventId = 'evt_123') {
    const headers: Record<string, string> = { 'content-type': 'application/json', 'faturapi-event-id': eventId }
    if (signature) headers['faturapi-signature'] = signature
    return new NextRequest('http://localhost/api/webhooks/faturapi', { method: 'POST', body, headers })
}

function signed(body = BODY) {
    const t = Math.floor(Date.now() / 1000)
    return `t=${t},v1=${computeFaturapiSignature(body, t, SECRET)}`
}

describe('POST /api/webhooks/faturapi', () => {
    beforeEach(() => {
        vi.stubEnv('FATURAPI_WEBHOOK_SECRET', SECRET)
        mockRecord.mockReset()
        mockProcess.mockReset()
        afterCallbacks.length = 0
        vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.unstubAllEnvs()
        vi.restoreAllMocks()
    })

    it('responde 401 sem tocar no banco quando a assinatura e invalida', async () => {
        const res = await POST(makeRequest(BODY, 't=1,v1=deadbeef'))
        expect(res.status).toBe(401)
        expect(mockRecord).not.toHaveBeenCalled()
    })

    it('responde 401 quando o header de assinatura esta ausente', async () => {
        const res = await POST(makeRequest(BODY))
        expect(res.status).toBe(401)
    })

    it('registra pelo Faturapi-Event-Id, responde 200 e so processa depois da resposta', async () => {
        mockRecord.mockResolvedValue(true)

        const res = await POST(makeRequest(BODY, signed()))

        expect(res.status).toBe(200)
        expect(mockRecord).toHaveBeenCalledWith('evt_123', EVENT)
        expect(mockProcess).not.toHaveBeenCalled()

        expect(afterCallbacks).toHaveLength(1)
        await afterCallbacks[0]()
        expect(mockProcess).toHaveBeenCalledWith('evt_123')
    })

    it('responde 200 e nao reprocessa evento duplicado', async () => {
        mockRecord.mockResolvedValue(false)

        const res = await POST(makeRequest(BODY, signed()))

        expect(res.status).toBe(200)
        expect(afterCallbacks).toHaveLength(0)
    })

    it('responde 500 quando nao consegue registrar o evento (Faturapi reenvia)', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
        mockRecord.mockRejectedValue(new Error('db down'))

        const res = await POST(makeRequest(BODY, signed()))

        expect(res.status).toBe(500)
        expect(afterCallbacks).toHaveLength(0)
    })
})
