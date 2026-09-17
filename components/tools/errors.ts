import type { Calculation, FieldError } from '@/lib/calculators/shared/validate';

/**
 * Field errors as a lookup, so each input can show its own message.
 *
 * A field left empty is not an error the reader needs shouting about — they are
 * probably still typing — so blank fields are filtered out and the result area
 * shows its waiting message instead.
 */
export function errorMap(
  result: Calculation<unknown>,
  values: Record<string, string>,
): Record<string, string> {
  if (result.ok) return {};
  const map: Record<string, string> = {};
  for (const error of result.errors as readonly FieldError[]) {
    const raw = values[error.field];
    const blank = raw !== undefined && raw.trim() === '';
    if (!blank && map[error.field] === undefined) {
      map[error.field] = error.message;
    }
  }
  return map;
}

/** Errors that belong to the form as a whole rather than one field. */
export function formErrors(result: Calculation<unknown>, values: Record<string, string>): string[] {
  if (result.ok) return [];
  return (result.errors as readonly FieldError[])
    .filter((error) => !(error.field in values))
    .map((error) => error.message);
}
