import { describe, it, expect, vi, beforeEach } from 'vitest'

const { requireAuth, syncClientInvertersData } = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  syncClientInvertersData: vi.fn(),
}))

vi.mock('@/backend/auth/middleware/auth.middleware', () => ({
  AuthMiddleware: { requireAuth: (...a: unknown[]) => requireAuth(...a) },
}))
vi.mock('@/backend/generation/services/generation.service', () => ({
  GenerationService: vi.fn(() => ({ syncClientInvertersData })),
}))
vi.mock('@/lib/prisma', () => ({ default: {} }))

import { POST } from './route'

describe('POST /api/generation/sync/client', () => {
  beforeEach(() => { requireAuth.mockReset(); syncClientInvertersData.mockReset() })

  it('syncs the authenticated user\'s client inverters', async () => {
    requireAuth.mockResolvedValue({ clientId: 'client-1', hasRole: () => false })
    syncClientInvertersData.mockResolvedValue({ results: [{}], errors: [], skipped: [] })
    const res = await POST(new Request('http://x/api/generation/sync/client', { method: 'POST' }) as any)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(syncClientInvertersData).toHaveBeenCalledWith('client-1')
  })

  it('returns success false when all synced inverters fail', async () => {
    requireAuth.mockResolvedValue({ clientId: 'client-1', hasRole: () => false })
    syncClientInvertersData.mockResolvedValue({
      results: [],
      errors: [{ inverterId: 'inv-1', error: 'provider failed' }],
      skipped: [],
    })

    const res = await POST(new Request('http://x/api/generation/sync/client', { method: 'POST' }) as any)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(false)
    expect(json.message).toBe('Falha ao sincronizar dados dos inversores. Verifique as credenciais de API.')
    expect(json.data.errors).toHaveLength(1)
  })
})
