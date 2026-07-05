import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({ default: {} }))

import { startGenerationSyncScheduler } from '../sync-scheduler'

describe('startGenerationSyncScheduler', () => {
  const ORIGINAL_INTERVAL_ENV = process.env.GENERATION_SYNC_INTERVAL_MINUTES
  let logSpy: ReturnType<typeof vi.spyOn>
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.useFakeTimers()
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    logSpy.mockRestore()
    errorSpy.mockRestore()
    if (ORIGINAL_INTERVAL_ENV === undefined) delete process.env.GENERATION_SYNC_INTERVAL_MINUTES
    else process.env.GENERATION_SYNC_INTERVAL_MINUTES = ORIGINAL_INTERVAL_ENV
  })

  it('does not schedule anything when GENERATION_SYNC_INTERVAL_MINUTES is unset', async () => {
    delete process.env.GENERATION_SYNC_INTERVAL_MINUTES
    const syncFn = vi.fn().mockResolvedValue({ results: [], errors: [], skipped: [] })

    const handle = startGenerationSyncScheduler(syncFn)

    expect(handle).toBeUndefined()
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000)
    expect(syncFn).not.toHaveBeenCalled()
  })

  it('fires syncAllInvertersData at the configured interval', async () => {
    process.env.GENERATION_SYNC_INTERVAL_MINUTES = '5'
    const syncFn = vi.fn().mockResolvedValue({ results: [{}], errors: [], skipped: [] })

    startGenerationSyncScheduler(syncFn)

    expect(syncFn).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(5 * 60 * 1000)
    expect(syncFn).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(5 * 60 * 1000)
    expect(syncFn).toHaveBeenCalledTimes(2)
  })

  it('falls back to 15 minutes when the env value is not a usable number', async () => {
    process.env.GENERATION_SYNC_INTERVAL_MINUTES = 'not-a-number'
    const syncFn = vi.fn().mockResolvedValue({ results: [], errors: [], skipped: [] })

    startGenerationSyncScheduler(syncFn)

    await vi.advanceTimersByTimeAsync(15 * 60 * 1000 - 1)
    expect(syncFn).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    expect(syncFn).toHaveBeenCalledTimes(1)
  })

  it('logs a structured summary with synced count and failures grouped by provider', async () => {
    process.env.GENERATION_SYNC_INTERVAL_MINUTES = '10'
    const syncFn = vi.fn().mockResolvedValue({
      results: [{}, {}],
      errors: [
        { inverterId: 'inv-1', provider: 'hoymiles', error: 'timeout' },
        { inverterId: 'inv-2', provider: 'hoymiles', error: 'timeout' },
        { inverterId: 'inv-3', provider: 'solis', error: 'invalid credentials' },
      ],
      skipped: [],
    })

    startGenerationSyncScheduler(syncFn)
    await vi.advanceTimersByTimeAsync(10 * 60 * 1000)

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('2 inversores sincronizados'),
      { hoymiles: 2, solis: 1 }
    )
  })

  it('does not throw and logs an error when a sync cycle rejects', async () => {
    process.env.GENERATION_SYNC_INTERVAL_MINUTES = '1'
    const syncFn = vi.fn().mockRejectedValue(new Error('db unavailable'))

    startGenerationSyncScheduler(syncFn)
    await vi.advanceTimersByTimeAsync(60 * 1000)

    expect(errorSpy).toHaveBeenCalled()
  })
})
