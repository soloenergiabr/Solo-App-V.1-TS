import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/prisma', () => ({ default: {} }));

import { ProcessJestorWebhookUseCase } from '../use-cases/process-jestor-webhook.use-case';
import { calculateReferralReward } from '../club-settings';
import { IndicationModel, IndicationStatus } from '../models/indication.model';
import type { TransactionModel } from '../models/transaction.model';

function setup(percent?: number) {
    const indication = new IndicationModel({ id: 'ind_1', referrerId: 'client_a', referredId: 'client_b', status: IndicationStatus.pending });
    const created: TransactionModel[] = [];
    const indications = {
        findByJestorId: vi.fn(async () => indication),
        findById: vi.fn(async () => indication),
        update: vi.fn(async () => {}),
    };
    const transactions = {
        create: vi.fn(async (t: TransactionModel) => { created.push(t); }),
        hasIndicationReward: vi.fn(async () => created.length > 0),
    };
    const useCase = new ProcessJestorWebhookUseCase(
        indications as never,
        transactions as never,
        percent === undefined ? undefined : async () => percent,
    );
    return { useCase, indication, created };
}

describe('recompensa de indicação', () => {
    it('calcula o % sobre o valor do projeto', () => {
        expect(calculateReferralReward(30000, 5)).toBe(1500);
        expect(calculateReferralReward(12345, 2.5)).toBe(308.63);
    });

    it('usa o % configurado pelo admin', async () => {
        const { useCase, created } = setup(10);
        await useCase.execute({ jestorId: 'j1', status: 'ganho', projectValue: 20000 });
        expect(created).toHaveLength(1);
        expect(created[0].amount).toBe(2000);
        expect(created[0].clientId).toBe('client_a');
    });

    it('cai para 5% quando não há regra configurada', async () => {
        const { useCase, created } = setup();
        await useCase.execute({ jestorId: 'j1', status: 'won', projectValue: 20000 });
        expect(created[0].amount).toBe(1000);
    });

    it('não paga duas vezes a mesma indicação', async () => {
        const { useCase, indication, created } = setup(5);
        await useCase.applyStatus(indication, IndicationStatus.approved, 20000);
        await useCase.applyStatus(indication, IndicationStatus.rejected);
        await useCase.applyStatus(indication, IndicationStatus.approved);
        expect(created).toHaveLength(1);
    });

    it('não paga sem valor de projeto nem quando a indicação é perdida', async () => {
        const { useCase, created } = setup(5);
        await useCase.execute({ jestorId: 'j1', status: 'perdido', projectValue: 20000 });
        const semValor = setup(5);
        await semValor.useCase.execute({ jestorId: 'j2', status: 'ganho' });
        expect(created).toHaveLength(0);
        expect(semValor.created).toHaveLength(0);
    });
});
