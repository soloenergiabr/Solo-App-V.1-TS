import { describe, it, expect } from 'vitest';
import {
    EventBus,
    EventType,
    BillUploadedPayload,
    BillConfirmedPayload,
    IndicationCreatedPayload,
} from './event-bus';

describe('EventBus', () => {
    it('should emit and listen for a bill.uploaded event', () => {
        const bus = EventBus.getInstance();

        const payload: BillUploadedPayload = {
            billId: 'bill_123',
            clientId: 'client_456',
            consumerUnitId: 'unit_789',
        };

        let receivedPayload: BillUploadedPayload | null = null;

        bus.on(EventType.BILL_UPLOADED, (data) => {
            receivedPayload = data;
        });

        bus.emit(EventType.BILL_UPLOADED, payload);

        expect(receivedPayload).not.toBeNull();
        expect(receivedPayload!.billId).toBe('bill_123');
        expect(receivedPayload!.clientId).toBe('client_456');
        expect(receivedPayload!.consumerUnitId).toBe('unit_789');
    });

    it('should emit and listen for a bill.confirmed event', () => {
        const bus = EventBus.getInstance();

        const payload: BillConfirmedPayload = {
            billId: 'bill_123',
            clientId: 'client_456',
            confirmedBy: 'user_789',
        };

        let receivedPayload: BillConfirmedPayload | null = null;

        bus.on(EventType.BILL_CONFIRMED, (data) => {
            receivedPayload = data;
        });

        bus.emit(EventType.BILL_CONFIRMED, payload);

        expect(receivedPayload).not.toBeNull();
        expect(receivedPayload!.billId).toBe('bill_123');
        expect(receivedPayload!.confirmedBy).toBe('user_789');
    });

    it('should keep existing INDICATION_CREATED event working', () => {
        const bus = EventBus.getInstance();

        const payload: IndicationCreatedPayload = {
            name: 'John',
            phone: '123456789',
            email: 'john@example.com',
            description: 'Test',
            whoReferring: 'Jane',
            phoneWhoReferring: '987654321',
            idLeadSoloApp: 'lead_001',
        };

        let receivedPayload: IndicationCreatedPayload | null = null;

        bus.on(EventType.INDICATION_CREATED, (data) => {
            receivedPayload = data;
        });

        bus.emit(EventType.INDICATION_CREATED, payload);

        expect(receivedPayload).not.toBeNull();
        expect(receivedPayload!.name).toBe('John');
    });
});
