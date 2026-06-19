/**
 * Strip markdown code-fence markers from a Gemini JSON response.
 */
export function cleanJsonText(text: string): string {
  let clean = text.trim()
  if (clean.startsWith('```json')) clean = clean.slice(7)
  if (clean.startsWith('```')) clean = clean.slice(3)
  if (clean.endsWith('```')) clean = clean.slice(0, -3)
  return clean.trim()
}

/**
 * Parse a value as a number (Brazilian locale aware) or return null.
 */
export function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const normalized =
    typeof value === 'string'
      ? value.replace(/\./g, '').replace(',', '.')
      : value
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Return a trimmed string or null for empty / missing values.
 */
export function stringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null
  const text = String(value).trim()
  return text.length > 0 ? text : null
}

/**
 * Parse a date string or return null.
 */
export function dateOrNull(value: unknown): Date | null {
  const text = stringOrNull(value)
  if (!text) return null
  const date = new Date(text)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * Infer a competence date (first of the month) from the raw value or fall
 * back to the reference month/year.
 */
export function inferCompetenceDate(
  referenceMonth: number,
  referenceYear: number,
  rawCompetenceDate: unknown,
): Date {
  const parsed = dateOrNull(rawCompetenceDate)
  if (parsed) return new Date(parsed.getFullYear(), parsed.getMonth(), 1)
  return new Date(referenceYear, referenceMonth - 1, 1)
}
