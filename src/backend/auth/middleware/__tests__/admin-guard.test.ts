import { describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const ctx = (roles: string[]) => ({ isAuthenticated: true, hasRole: (r: string) => roles.includes(r), hasPermission: () => true })
vi.mock('../../services/jwt.service', () => ({
    JwtService: {
        extractTokenFromHeader: (h: string | null) => h?.replace('Bearer ', ''),
        createUserContextFromToken: (token: string) => ctx(token === 'admin' ? ['master'] : ['user']),
    },
}))

import { AuthMiddleware, isAdminApiPath } from '../auth.middleware'

const req = (path: string, token: string) =>
    new NextRequest(`http://localhost${path}`, { headers: { Authorization: `Bearer ${token}` } })

describe('proteção das APIs administrativas', () => {
    it('identifica as rotas de admin', () => {
        expect(isAdminApiPath(req('/api/admin/clients', 'x'))).toBe(true)
        expect(isAdminApiPath(req('/api/club/admin/offers', 'x'))).toBe(true)
        expect(isAdminApiPath(req('/api/administrator', 'x'))).toBe(false)
        expect(isAdminApiPath(req('/api/economia/bills', 'x'))).toBe(false)
    })
    it('cliente comum é barrado nas rotas de admin', async () => {
        await expect(AuthMiddleware.extractUserContext(req('/api/admin/clients', 'cliente'))).rejects.toThrow('does not have role')
        await expect(AuthMiddleware.requireAuth(req('/api/club/admin/offers', 'cliente'))).rejects.toThrow('does not have role')
    })
    it('admin passa, e cliente continua usando as rotas dele', async () => {
        await expect(AuthMiddleware.extractUserContext(req('/api/admin/clients', 'admin'))).resolves.toBeTruthy()
        await expect(AuthMiddleware.requireAuth(req('/api/economia/bills', 'cliente'))).resolves.toBeTruthy()
    })
})
