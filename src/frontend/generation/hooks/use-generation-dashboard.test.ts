// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

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
})
