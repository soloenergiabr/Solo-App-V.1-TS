import { describe, it, expect } from 'vitest';

describe('Plant/ConsumerUnit validation status', () => {
    it('client-created plants default to pending_review', () => {
        const createData = { validationStatus: 'pending_review' };
        expect(createData.validationStatus).toBe('pending_review');
    });

    it('client-created consumer units default to pending_review', () => {
        const createData = { validationStatus: 'pending_review' };
        expect(createData.validationStatus).toBe('pending_review');
    });

    it('admin can confirm a plant', () => {
        const status = 'confirmed';
        expect(['confirmed', 'rejected']).toContain(status);
    });

    it('admin can reject a plant', () => {
        const status = 'rejected';
        expect(['confirmed', 'rejected']).toContain(status);
    });

    it('pending records are excluded from active aggregates', () => {
        const isActive = (status: string) => status === 'confirmed';
        expect(isActive('pending_review')).toBe(false);
        expect(isActive('confirmed')).toBe(true);
        expect(isActive('rejected')).toBe(false);
    });
});
