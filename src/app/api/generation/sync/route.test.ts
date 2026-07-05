import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { requireAuth, syncAllInvertersData } = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  syncAllInvertersData: vi.fn(),
}))

vi.mock('@/backend/auth/middleware/auth.middleware', () => ({
  AuthMiddleware: { requireAuth: (...a: unknown[]) => requireAuth(...a) },
}))
vi.mock('@/backend/generation/services/generation.service', () => ({
  GenerationService: vi.fn(() => ({ syncAllInvertersData })),
}))
vi.mock('@/lib/prisma', () => ({ default: {} }))

import { POST } from './route'

function makeRequest(headers: Record<string, string> = {}) {
  return new Request('http://x/api/generation/sync', { method: 'POST', headers }) as any
}

describe('POST /api/generation/sync', () => {
  const ORIGINAL_TOKEN = process.env.GENERATION_SYNC_TOKEN

  beforeEach(() => {
    requireAuth.mockReset()
    syncAllInvertersData.mockReset()
  })

  afterEach(() => {
    if (ORIGINAL_TOKEN === undefined) delete process.env.GENERATION_SYNC_TOKEN
    else process.env.GENERATION_SYNC_TOKEN = ORIGINAL_TOKEN
  })

  it('returns 401 when there is no token header and no auth session', async () => {
    delete process.env.GENERATION_SYNC_TOKEN
    requireAuth.mockRejectedValue(new Error('User is not authenticated'))

    const res = await POST(makeRequest())

    expect(res.status).toBe(401)
    expect(syncAllInvertersData).not.toHaveBeenCalled()
  })

  it('returns 401 when GENERATION_SYNC_TOKEN is unset even if a header is sent (no open door)', async () => {
    delete process.env.GENERATION_SYNC_TOKEN
    requireAuth.mockRejectedValue(new Error('User is not authenticated'))

    const res = await POST(makeRequest({ 'x-sync-token': 'anything' }))

    expect(res.status).toBe(401)
    expect(syncAllInvertersData).not.toHaveBeenCalled()
  })

  it('returns 401 when the token header does not match GENERATION_SYNC_TOKEN', async () => {
    process.env.GENERATION_SYNC_TOKEN = 'correct-secret'
    requireAuth.mockRejectedValue(new Error('User is not authenticated'))

    const res = await POST(makeRequest({ 'x-sync-token': 'wrong-secret' }))

    expect(res.status).toBe(401)
    expect(syncAllInvertersData).not.toHaveBeenCalled()
  })

  it('returns 401 when an authenticated session lacks admin/master role', async () => {
    delete process.env.GENERATION_SYNC_TOKEN
    requireAuth.mockResolvedValue({ hasRole: () => false })

    const res = await POST(makeRequest())

    expect(res.status).toBe(401)
    expect(syncAllInvertersData).not.toHaveBeenCalled()
  })

  it('syncs when the token header matches GENERATION_SYNC_TOKEN', async () => {
    process.env.GENERATION_SYNC_TOKEN = 'correct-secret'
    syncAllInvertersData.mockResolvedValue({ results: [], errors: [], skipped: [] })

    const res = await POST(makeRequest({ 'x-sync-token': 'correct-secret' }))

    expect(res.status).toBe(200)
    expect(syncAllInvertersData).toHaveBeenCalledOnce()
    expect(requireAuth).not.toHaveBeenCalled()
  })

  it('syncs when an authenticated admin session is present, without a token', async () => {
    delete process.env.GENERATION_SYNC_TOKEN
    requireAuth.mockResolvedValue({ hasRole: (role: string) => role === 'admin' })
    syncAllInvertersData.mockResolvedValue({ results: [], errors: [], skipped: [] })

    const res = await POST(makeRequest())

    expect(res.status).toBe(200)
    expect(syncAllInvertersData).toHaveBeenCalledOnce()
  })

  it('syncs when an authenticated master session is present, without a token', async () => {
    delete process.env.GENERATION_SYNC_TOKEN
    requireAuth.mockResolvedValue({ hasRole: (role: string) => role === 'master' })
    syncAllInvertersData.mockResolvedValue({ results: [], errors: [], skipped: [] })

    const res = await POST(makeRequest())

    expect(res.status).toBe(200)
    expect(syncAllInvertersData).toHaveBeenCalledOnce()
  })
})
