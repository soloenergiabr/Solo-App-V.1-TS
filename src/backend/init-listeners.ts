import { eventBus, EventType } from './shared/event-bus';
import { onIndicationCreatedToJestor } from './indication/listeners/jestor.listener';
import { ensureBucketExists } from '@/lib/object-storage';

let initialized = false;

export const initListeners = () => {
    if (initialized) return;

    eventBus.on(EventType.INDICATION_CREATED, onIndicationCreatedToJestor);

    // Garantir que o bucket de object storage existe (MinIO/S3)
    // Falha silenciosa se o storage não estiver disponível — o upload
    // retornará erro claro ao usuário.
    ensureBucketExists().catch(() => {});

    console.log('Event listeners initialized');
    initialized = true;
};
