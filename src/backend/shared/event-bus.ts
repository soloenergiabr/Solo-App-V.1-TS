import { EventEmitter } from 'events';

export enum EventType {
    INDICATION_CREATED = 'indication:created',
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

    public emit(event: EventType.INDICATION_CREATED, payload: IndicationCreatedPayload): boolean;
    public emit(event: string, ...args: any[]): boolean {
        return super.emit(event, ...args);
    }

    public on(event: EventType.INDICATION_CREATED, listener: (payload: IndicationCreatedPayload) => void): this;
    public on(event: string, listener: (...args: any[]) => void): this {
        return super.on(event, listener);
    }
}

export const eventBus = EventBus.getInstance();
