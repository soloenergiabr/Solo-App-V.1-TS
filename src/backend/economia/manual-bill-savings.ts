/**
 * Computes a fallback savings value for manual energy bills.
 *
 * Priority order:
 * 1. If `estimatedSavings` is explicitly provided, return it unchanged.
 * 2. If both `consumptionKwh` and `tariffPerKwh` are available,
 *    compute: consumptionKwh * tariffPerKwh - totalBillValue
 *    (clamped to a minimum of 0).
 * 3. Otherwise return null (cannot compute).
 */
export function computeFallbackSavings(input: {
  estimatedSavings?: number | null;
  consumptionKwh?: number | null;
  tariffPerKwh?: number | null;
  totalBillValue?: number | null;
}): number | null {
  if (input.estimatedSavings != null) return input.estimatedSavings;
  if (input.consumptionKwh == null || input.tariffPerKwh == null) return null;
  return Math.max(0, input.consumptionKwh * input.tariffPerKwh - (input.totalBillValue ?? 0));
}
