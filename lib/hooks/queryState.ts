import type { UnitSystem } from '@/lib/calculators/shared/units';

/**
 * Building and reading the query string a tool keeps its inputs in.
 *
 * Kept as pure functions, separate from the hook, because the rules here are
 * where the behaviour actually lives and they are worth testing directly.
 */
export type ToolValues = Record<string, string>;

/** How long typing must pause before the address bar is rewritten. */
export const URL_DEBOUNCE_MS = 400;

/** The unit system a page opens in, and so the one never written to the URL. */
export const DEFAULT_UNITS: UnitSystem = 'imperial';

/** The query-string key each field travels under, e.g. { length: 'l' }. */
export type ParamMap = Readonly<Record<string, string>>;

export function buildQuery({
  values,
  defaults,
  params,
  units,
  includeAll = false,
  alwaysInclude = [],
}: {
  values: ToolValues;
  defaults: ToolValues;
  params: ParamMap;
  units: UnitSystem;
  /**
   * False for the address bar: only what differs from the defaults, so changing
   * one field gives `?l=10` rather than every parameter the tool has.
   *
   * True for a link the reader copies to share: every value is spelled out, so
   * the link keeps meaning what it meant even if a default changes later.
   */
  includeAll?: boolean;
  /**
   * Param keys always written, even when matching defaults. Used for URL
   * version markers (e.g. bulk soil's v=2): once the page has migrated legacy
   * semantics, every generated URL must carry the marker, or a reload would
   * reinterpret the values as legacy.
   */
  alwaysInclude?: string[];
}): URLSearchParams {
  const query = new URLSearchParams();

  for (const [field, key] of Object.entries(params)) {
    const value = values[field];
    if (value === undefined || value === '') continue;
    if (!includeAll && !alwaysInclude.includes(key) && value === defaults[field]) continue;
    query.set(key, value);
  }

  if (includeAll || units !== DEFAULT_UNITS) {
    query.set('u', units);
  }

  return query;
}

/** The values and unit system a shared link carried, if any. */
export function parseQuery(
  search: string,
  params: ParamMap,
): { values: ToolValues; units: UnitSystem | null } {
  const query = new URLSearchParams(search);
  const values: ToolValues = {};

  for (const [field, key] of Object.entries(params)) {
    const raw = query.get(key);
    if (raw !== null) values[field] = raw;
  }

  const shared = query.get('u');
  return {
    values,
    units: shared === 'metric' || shared === 'imperial' ? shared : null,
  };
}

/** A path with the query string appended, or the bare path when empty. */
export function pathWithQuery(pathname: string, query: URLSearchParams): string {
  const encoded = query.toString();
  return encoded ? `${pathname}?${encoded}` : pathname;
}
