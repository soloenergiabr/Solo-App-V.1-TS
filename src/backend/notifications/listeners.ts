import { eventBus, EventType } from '@/backend/shared/event-bus'
import {
    onBillPaid,
    onBillUploaded,
    onFaturapiCredentialsInvalid,
    onFaturapiUnitOverdue,
    onGdChargePaid,
    safeListener,
} from './triggers'

export function registerNotificationListeners(): void {
    eventBus.on(EventType.BILL_UPLOADED, safeListener('nova fatura', onBillUploaded))
    eventBus.on(EventType.BILL_PAID, safeListener('pagamento da fatura', onBillPaid))
    eventBus.on(EventType.GD_CHARGE_PAID, safeListener('pagamento da cobrança', onGdChargePaid))
    eventBus.on(EventType.FATURAPI_UNIT_OVERDUE, safeListener('fatura atrasada', onFaturapiUnitOverdue))
    eventBus.on(EventType.FATURAPI_CREDENTIALS_INVALID, safeListener('senha da distribuidora', onFaturapiCredentialsInvalid))
}
