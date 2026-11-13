import { describe, it, expect } from 'vitest'
import { toCents } from './stripe'

describe('toCents', () => {
    it('converte reais em centavos inteiros sem erro de ponto flutuante', () => {
        expect(toCents(123.45)).toBe(12345)
        expect(toCents(0.29)).toBe(29) // 0.29 * 100 = 28.999999999999996
        expect(toCents(1.005)).toBe(100)
        expect(toCents('89.9')).toBe(8990) // Decimal do Prisma chega como string/objeto
        expect(toCents({ toString: () => '10.10' })).toBe(1010)
    })

    it('recusa valor invalido', () => {
        expect(() => toCents('abc')).toThrow()
        expect(() => toCents(undefined)).toThrow()
    })
})
