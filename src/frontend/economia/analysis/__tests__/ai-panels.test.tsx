// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { AlertsPanel } from '../alerts-panel'
import { RecommendationsPanel } from '../recommendations-panel'
import { LineItemExplanations } from '../line-item-explanations'

// Formato real devolvido pelo analisador (prompts.ts): objetos, nao strings.
describe('painéis da análise por IA', () => {
    it('mostram título e texto, nunca JSON cru ou [object Object]', () => {
        const { container } = render(
            <>
                <AlertsPanel alerts={[{ type: 'success', icon: '☀️', title: 'Solar cobriu o mínimo', description: 'Tudo certo.', action: null }]} />
                <RecommendationsPanel recommendations={[{ priority: 'alta', title: 'Monitore os créditos', description: 'Saldo alto.', estimated_savings: 'Até R$ 350/mês' }]} />
                <LineItemExplanations explanations={{
                    consumption: { title: 'O que você consumiu', description: '601 kWh.' },
                    taxes: { icms: { title: 'ICMS', description: 'Imposto estadual.' } },
                }} />
            </>,
        )
        const text = container.textContent ?? ''
        expect(text).not.toMatch(/\[object Object\]|\{"/)
        for (const t of ['Solar cobriu o mínimo', 'Monitore os créditos', 'Prioridade alta', 'Até R$ 350/mês', 'O que você consumiu', 'ICMS', 'Imposto estadual.']) {
            expect(text).toContain(t)
        }
    })
})
