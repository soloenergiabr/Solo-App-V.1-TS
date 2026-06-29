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
})
