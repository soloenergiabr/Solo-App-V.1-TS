import { EventEmitter } from 'events';

export enum EventType {
    INDICATION_CREATED = 'indication:created',

    // Bill lifecycle events
    BILL_UPLOADED = 'bill.uploaded',
    BILL_CONFIRMED = 'bill.confirmed',
    BILL_ANALYZED = 'bill.analyzed',
    BILL_DUE = 'bill.due',
    BILL_OVERDUE = 'bill.overdue',
    BILL_PAID = 'bill.paid',

    // Rateio events
    RATEIO_CHANGE_REQUESTED = 'rateio.change_requested',
    RATEIO_APPLIED = 'rateio.applied',

    // Inverter events
    INVERTER_CONNECTED = 'inverter.connected',

    // Geracao distribuida (cobranca entre titular e responsaveis)
    GD_CHARGE_SENT = 'gd.charge_sent',
    GD_CHARGE_PAID = 'gd.charge_paid',
    GD_PAYER_INVITED = 'gd.payer_invited',
    GD_PAYER_ACCEPTED = 'gd.payer_accepted',
}

export interface IndicationCreatedPayload {
    name: string;
    phone: string;
    email: string;
    description: string;
    whoReferring: string;
    phoneWhoReferring: string;
    idLeadSoloApp: string;
}

// Bill lifecycle payloads
export interface BillUploadedPayload {
    billId: string;
    clientId: string;
    consumerUnitId: string;
}

export interface BillConfirmedPayload {
    billId: string;
    clientId: string;
    confirmedBy: string;
}

export interface BillAnalyzedPayload {
    billId: string;
    clientId: string;
    billScore: number | null;
}

export interface BillDuePayload {
    billId: string;
    clientId: string;
    dueDate: string;
}

export interface BillOverduePayload {
    billId: string;
    clientId: string;
}

export interface BillPaidPayload {
    billId: string;
    clientId: string;
    paidAt: string;
}

// Rateio payloads
export interface RateioChangeRequestedPayload {
    allocationId: string;
    clientId: string;
}

export interface RateioAppliedPayload {
    allocationId: string;
    clientId: string;
    appliedBy: string;
}

// Inverter payloads
export interface InverterConnectedPayload {
    inverterId: string;
    clientId: string;
    provider: string;
}

// Geracao distribuida payloads
export interface GdChargeSentPayload {
    chargeId: string;
    clientId: string;
    consumerUnitId: string;
    payerEmail: string;
}

export interface GdChargePaidPayload {
    chargeId: string;
    clientId: string;
    consumerUnitId: string;
    paidAt: string;
}

export interface GdPayerInvitedPayload {
    inviteId: string;
    clientId: string;
    consumerUnitId: string;
    email: string;
}

export interface GdPayerAcceptedPayload {
    inviteId: string;
    clientId: string;
    consumerUnitId: string;
    userId: string;
}

export class EventBus extends EventEmitter {
    private static instance: EventBus;

    private constructor() {
        super();
    }

    public static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    // Indication events
    public emit(event: EventType.INDICATION_CREATED, payload: IndicationCreatedPayload): boolean;
    // Bill lifecycle events
    public emit(event: EventType.BILL_UPLOADED, payload: BillUploadedPayload): boolean;
    public emit(event: EventType.BILL_CONFIRMED, payload: BillConfirmedPayload): boolean;
    public emit(event: EventType.BILL_ANALYZED, payload: BillAnalyzedPayload): boolean;
    public emit(event: EventType.BILL_DUE, payload: BillDuePayload): boolean;
    public emit(event: EventType.BILL_OVERDUE, payload: BillOverduePayload): boolean;
    public emit(event: EventType.BILL_PAID, payload: BillPaidPayload): boolean;
    // Rateio events
    public emit(event: EventType.RATEIO_CHANGE_REQUESTED, payload: RateioChangeRequestedPayload): boolean;
    public emit(event: EventType.RATEIO_APPLIED, payload: RateioAppliedPayload): boolean;
    // Inverter events
    public emit(event: EventType.INVERTER_CONNECTED, payload: InverterConnectedPayload): boolean;
    // Geracao distribuida events
    public emit(event: EventType.GD_CHARGE_SENT, payload: GdChargeSentPayload): boolean;
    public emit(event: EventType.GD_CHARGE_PAID, payload: GdChargePaidPayload): boolean;
    public emit(event: EventType.GD_PAYER_INVITED, payload: GdPayerInvitedPayload): boolean;
    public emit(event: EventType.GD_PAYER_ACCEPTED, payload: GdPayerAcceptedPayload): boolean;
    // Fallback
    public emit(event: string, ...args: any[]): boolean {
        return super.emit(event, ...args);
    }

    // Indication events
    public on(event: EventType.INDICATION_CREATED, listener: (payload: IndicationCreatedPayload) => void): this;
    // Bill lifecycle events
    public on(event: EventType.BILL_UPLOADED, listener: (payload: BillUploadedPayload) => void): this;
    public on(event: EventType.BILL_CONFIRMED, listener: (payload: BillConfirmedPayload) => void): this;
    public on(event: EventType.BILL_ANALYZED, listener: (payload: BillAnalyzedPayload) => void): this;
    public on(event: EventType.BILL_DUE, listener: (payload: BillDuePayload) => void): this;
    public on(event: EventType.BILL_OVERDUE, listener: (payload: BillOverduePayload) => void): this;
    public on(event: EventType.BILL_PAID, listener: (payload: BillPaidPayload) => void): this;
    // Rateio events
    public on(event: EventType.RATEIO_CHANGE_REQUESTED, listener: (payload: RateioChangeRequestedPayload) => void): this;
    public on(event: EventType.RATEIO_APPLIED, listener: (payload: RateioAppliedPayload) => void): this;
    // Inverter events
    public on(event: EventType.INVERTER_CONNECTED, listener: (payload: InverterConnectedPayload) => void): this;
    // Geracao distribuida events
    public on(event: EventType.GD_CHARGE_SENT, listener: (payload: GdChargeSentPayload) => void): this;
    public on(event: EventType.GD_CHARGE_PAID, listener: (payload: GdChargePaidPayload) => void): this;
    public on(event: EventType.GD_PAYER_INVITED, listener: (payload: GdPayerInvitedPayload) => void): this;
    public on(event: EventType.GD_PAYER_ACCEPTED, listener: (payload: GdPayerAcceptedPayload) => void): this;
    // Fallback
    public on(event: string, listener: (...args: any[]) => void): this {
        return super.on(event, listener);
    }
}

export const eventBus = EventBus.getInstance();
