/**
 * Input validation shared by every calculator.
 *
 * Each calculator returns either a result or a list of field errors — it never
 * returns a number it is not sure about, so no interface can display `NaN` or
 * `Infinity`.
 */
export type FieldError = { field: string; message: string };

export type Calculation<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly errors: readonly FieldError[] };

/**
 * The largest value any input accepts. Well beyond any real garden, and low
 * enough that cubing it stays comfortably finite in double precision.
 */
export const MAX_INPUT = 1_000_000_000;

export function ok<T>(value: T): Calculation<T> {
  return { ok: true, value };
}

export function fail<T>(errors: readonly FieldError[]): Calculation<T> {
  return { ok: false, errors };
}

/** Drops the nulls, so a list of checks becomes a list of real errors. */
export function collect(checks: readonly (FieldError | null)[]): FieldError[] {
  return checks.filter((check): check is FieldError => check !== null);
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** Rejects blank, non-numeric, NaN and infinite input. */
export function requireNumber(value: unknown, field: string, label: string): FieldError | null {
  return isNumber(value) ? null : { field, message: `Enter a number for ${label}` };
}

export function requirePositive(value: unknown, field: string, label: string): FieldError | null {
  const notANumber = requireNumber(value, field, label);
  if (notANumber) return notANumber;
  if ((value as number) <= 0) {
    return { field, message: `Enter a ${label} greater than 0` };
  }
  return requireMax(value, field, label);
}

export function requireNonNegative(
  value: unknown,
  field: string,
  label: string,
): FieldError | null {
  const notANumber = requireNumber(value, field, label);
  if (notANumber) return notANumber;
  if ((value as number) < 0) {
    return { field, message: `${sentence(label)} cannot be negative` };
  }
  return requireMax(value, field, label);
}

export function requireMax(value: unknown, field: string, label: string): FieldError | null {
  if (isNumber(value) && Math.abs(value) > MAX_INPUT) {
    return {
      field,
      message: `That ${label} is too large — enter a value under ${MAX_INPUT.toLocaleString('en-US')}`,
    };
  }
  return null;
}

export function requireCount(value: unknown, field: string, label: string): FieldError | null {
  const notPositive = requirePositive(value, field, label);
  if (notPositive) return notPositive;
  if (!Number.isInteger(value)) {
    return { field, message: `Enter a whole number for ${label}` };
  }
  return null;
}

export function requireRange(
  value: unknown,
  min: number,
  max: number,
  field: string,
  label: string,
): FieldError | null {
  const notANumber = requireNumber(value, field, label);
  if (notANumber) return notANumber;
  const numeric = value as number;
  if (numeric < min || numeric > max) {
    return { field, message: `Enter a ${label} between ${min} and ${max}` };
  }
  return null;
}

/** Capitalises the first letter for messages that start with the label. */
function sentence(label: string): string {
  return label.charAt(0).toUpperCase() + label.slice(1);
}
