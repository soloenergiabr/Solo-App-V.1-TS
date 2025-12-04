import { eventBus, EventType } from './shared/event-bus';
import { onIndicationCreatedToJestor } from './indication/listeners/jestor.listener';

let initialized = false;

export const initListeners = () => {
    if (initialized) return;

    eventBus.on(EventType.INDICATION_CREATED, onIndicationCreatedToJestor);

    console.log('Event listeners initialized');
    initialized = true;
};
