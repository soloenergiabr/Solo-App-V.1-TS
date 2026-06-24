import { Prisma } from '@/app/generated/prisma'
import { RawBillData, RawBillLineItem, RawCreditSummary, RawExtraCharge } from './types'

/* ------------------------------------------------------------------ */
/*  Return type                                                         */
/* ------------------------------------------------------------------ */

export interface BillJsonColumns {
  billingItems: RawBillLineItem[] | typeof Prisma.JsonNull
  creditSummary: RawCreditSummary | typeof Prisma.JsonNull
  extraCharges: RawExtraCharge[] | typeof Prisma.JsonNull
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function mapBillingItems(
  raw: RawBillData,
): RawBillLineItem[] | typeof Prisma.JsonNull {
  // Prefer the raw snake_case source (model output); fall back to typed field
  const items = raw.billing_table_items ?? raw.billingItems
  if (!items || items.length === 0) return Prisma.JsonNull
  return items
}

function mapCreditSummary(
  raw: RawBillData,
): RawCreditSummary | typeof Prisma.JsonNull {
  // Build from scee_* fields first (model output)
  const hasSceeFields =
    raw.scee_injected_kwh != null ||
    raw.scee_used_kwh != null ||
    raw.scee_balance_kwh != null ||
    raw.scee_expiring_kwh != null

  if (hasSceeFields) {
    return {
      injected_kwh: raw.scee_injected_kwh ?? null,
      used_kwh: raw.scee_used_kwh ?? null,
      balance_kwh: raw.scee_balance_kwh ?? null,
      expiring_kwh: raw.scee_expiring_kwh ?? null,
    }
  }

  // Fall back to typed creditSummary if it has any non-null entries
  const cs = raw.creditSummary as Record<string, unknown>
  const hasAnyValue = Object.values(cs).some((v) => v != null)
  if (hasAnyValue) return raw.creditSummary as RawCreditSummary

  return Prisma.JsonNull
}

function mapExtraCharges(
  raw: RawBillData,
): RawExtraCharge[] | typeof Prisma.JsonNull {
  const services: RawExtraCharge[] = (raw.service_items ?? []).map((item) => ({
    description: item.description,
    value: item.value,
    type: 'service' as const,
  }))

  const installments: RawExtraCharge[] = (raw.installment_items ?? []).map(
    (item) => ({
      description: item.description,
      value: item.value,
      type: 'installment' as const,
      remaining_installments: item.remaining_installments ?? null,
    }),
  )

  const merged = [...services, ...installments]
  if (merged.length === 0) return Prisma.JsonNull
  return merged
}

/* ------------------------------------------------------------------ */
/*  Public API                                                          */
/* ------------------------------------------------------------------ */

/**
 * Pure function: transforms a RawBillData object into the three Prisma
 * JSON column values stored on the EnergyBill row.
 * No I/O, no Prisma client, no AI calls.
 */
export function mapRawToBillJson(raw: RawBillData): BillJsonColumns {
  return {
    billingItems: mapBillingItems(raw),
    creditSummary: mapCreditSummary(raw),
    extraCharges: mapExtraCharges(raw),
  }
}
