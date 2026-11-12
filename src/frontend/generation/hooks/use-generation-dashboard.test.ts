// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, it, expect, vi } from 'vitest'

const post = vi.fn().mockResolvedValue({ data: { success: true, data: {} } })
const get = vi.fn().mockResolvedValue({ data: { success: true, data: { overview: {}, timeSeries: [], byInverter: [], byType: {}, filters: { appliedFilters: 0 } } } })

vi.mock('@/frontend/auth/hooks/useAuthenticatedApi', () => ({
  useAuthenticatedApi: () => ({ get, post, isAuthenticated: true }),
}))

import { buildWeekSeries, getWeekRange, useGenerationDashboard } from './use-generation-dashboard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(QueryClientProvider, { client: new QueryClient() }, children)

describe('useGenerationDashboard', () => {
  beforeEach(() => {
    post.mockReset()
    get.mockReset()
    post.mockResolvedValue({ data: { success: true, data: {} } })
    get.mockResolvedValue({ data: { success: true, data: { overview: {}, timeSeries: [], byInverter: [], byType: {}, filters: { appliedFilters: 0 } } } })
  })

  it('triggers a client sync on mount before reading analytics', async () => {
    renderHook(() => useGenerationDashboard({}), { wrapper })
    await waitFor(() => expect(post).toHaveBeenCalledWith('/generation/sync/client'))
  })

  it('re-syncs the client when refetch is called manually', async () => {
    const { result } = renderHook(() => useGenerationDashboard({}), { wrapper })
    await waitFor(() => expect(post).toHaveBeenCalledWith('/generation/sync/client'))
    post.mockClear()

    await act(async () => {
      await result.current.refetch()
    })

    expect(post).toHaveBeenCalledWith('/generation/sync/client')
  })

  it('exposes sync errors returned by the client sync endpoint', async () => {
    post.mockResolvedValueOnce({
      data: {
        success: false,
        message: 'Falha ao sincronizar dados dos inversores.',
        data: { errors: [{ inverterId: 'inv-1', error: 'provider failed' }] },
      },
    })

    const { result } = renderHook(() => useGenerationDashboard({}), { wrapper })

    await waitFor(() => {
      expect(result.current.syncError).toBe('Falha ao sincronizar dados dos inversores.')
    })
  })
})

describe('semana (aba Semanal)', () => {
  it('vai de segunda 00:00 a domingo 23:59 da semana da data', () => {
    // quinta-feira, 12/11/2026
    const { start, end } = getWeekRange(new Date(2026, 10, 12, 15, 30))
    expect(start).toEqual(new Date(2026, 10, 9, 0, 0, 0, 0))
    expect(end).toEqual(new Date(2026, 10, 15, 23, 59, 59, 999))
  })

  it('domingo pertence à semana que começou na segunda anterior', () => {
    const { start } = getWeekRange(new Date(2026, 10, 15, 10))
    expect(start).toEqual(new Date(2026, 10, 9))
  })

  it('gera 7 barras somando os registros de cada dia', () => {
    const start = new Date(2026, 10, 9)
    const at = (d: number, h: number) => new Date(2026, 10, d, h).toISOString()
    const series = buildWeekSeries([
      { timestamp: at(9, 10), energy: 10, power: 1, inverterCount: 1 },
      { timestamp: at(9, 14), energy: 5, power: 2, inverterCount: 1 },
      { timestamp: at(15, 12), energy: 7, power: 3, inverterCount: 2 },
    ], start)
    expect(series).toHaveLength(7)
    expect(series.map((p) => p.energy)).toEqual([15, 0, 0, 0, 0, 0, 7])
    expect(series[6].inverterCount).toBe(2)
  })
})
