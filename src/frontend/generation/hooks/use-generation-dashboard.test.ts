// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, it, expect, vi } from 'vitest'

const post = vi.fn().mockResolvedValue({ data: { success: true, data: {} } })
const get = vi.fn().mockResolvedValue({ data: { success: true, data: { overview: {}, timeSeries: [], byInverter: [], byType: {}, filters: { appliedFilters: 0 } } } })

vi.mock('@/frontend/auth/hooks/useAuthenticatedApi', () => ({
  useAuthenticatedApi: () => ({ get, post, isAuthenticated: true }),
}))

import { useGenerationDashboard } from './use-generation-dashboard'
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
