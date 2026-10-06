'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  KG_PER_100SQM_TO_LB_PER_1000SQFT,
  LITERS_PER_CUBIC_FOOT,
  MM_PER_INCH,
  US_DRY_QUARTS_PER_CUBIC_FOOT,
  centimetersToInches,
  cubicFeetToLiters,
  cubicMetersToCubicYards,
  cubicYardsToCubicMeters,
  feetToMeters,
  inchesToCentimeters,
  kgPerCubicMeterToLbPerCubicYard,
  kilogramsToPounds,
  lbPer1000SqFtToKgPer100SqM,
  lbPerCubicYardToKgPerCubicMeter,
  metersToFeet,
  poundsToKilograms,
  squareFeetToSquareMeters,
  squareMetersToSquareFeet,
  type UnitSystem,
} from '@/lib/calculators/shared/units';
import { toSignificant } from '@/lib/calculators/shared/round';
import { readInitialSearch, useCapturedBrowserValue } from './useBrowserValue';
import {
  URL_DEBOUNCE_MS,
  buildQuery,
  parseQuery,
  pathWithQuery,
  type ParamMap,
  type ToolValues,
} from './queryState';
import { useUnits } from './useUnits';

/**
 * What a numeric field measures, so switching units converts the value rather
 * than silently relabelling it. Typing 8 feet and toggling to metric should
 * give 2.44 metres, not 8 metres.
 *
 * `none` covers counts, percentages, pH, dates and anything already unitless.
 */
export type FieldKind =
  | 'span' // feet <-> meters
  | 'short' // inches <-> centimeters
  | 'area' // sq ft <-> m2
  | 'volume' // cu ft <-> liters
  | 'dry-volume' // US dry quarts <-> liters, how potting mix is sold
  | 'mass' // pounds <-> kilograms
  | 'rainfall' // inches <-> millimeters
  | 'rate' // lb per 1,000 sq ft <-> kg per 100 m2
  | 'density' // lb per cubic yard <-> kg per cubic meter
  | 'bulk-volume' // cubic yards <-> cubic meters
  | 'none';

function convert(value: number, kind: FieldKind, to: UnitSystem): number {
  if (kind === 'none' || !Number.isFinite(value)) return value;
  const toMetric = to === 'metric';
  switch (kind) {
    case 'span':
      return toMetric ? feetToMeters(value) : metersToFeet(value);
    case 'short':
      return toMetric ? inchesToCentimeters(value) : centimetersToInches(value);
    case 'area':
      return toMetric ? squareFeetToSquareMeters(value) : squareMetersToSquareFeet(value);
    case 'volume':
      return toMetric ? cubicFeetToLiters(value) : value / LITERS_PER_CUBIC_FOOT;
    case 'dry-volume': {
      const litersPerDryQuart = LITERS_PER_CUBIC_FOOT / US_DRY_QUARTS_PER_CUBIC_FOOT;
      return toMetric ? value * litersPerDryQuart : value / litersPerDryQuart;
    }
    case 'mass':
      return toMetric ? poundsToKilograms(value) : kilogramsToPounds(value);
    case 'rainfall':
      return toMetric ? value * MM_PER_INCH : value / MM_PER_INCH;
    case 'rate':
      return toMetric
        ? lbPer1000SqFtToKgPer100SqM(value)
        : value * KG_PER_100SQM_TO_LB_PER_1000SQFT;
    case 'density':
      return toMetric
        ? lbPerCubicYardToKgPerCubicMeter(value)
        : kgPerCubicMeterToLbPerCubicYard(value);
    case 'bulk-volume':
      return toMetric ? cubicYardsToCubicMeters(value) : cubicMetersToCubicYards(value);
  }
}

/**
 * Field values are held as strings, because that is what an input holds. An
 * empty string is a genuinely empty field and must not silently become zero.
 */
export type { ToolValues };

export type ToolStateOptions = {
  /** Defaults for imperial, which is what the tool opens with. */
  readonly imperialDefaults: ToolValues;
  /** Defaults for metric, so a metric reader gets round numbers too. */
  readonly metricDefaults?: ToolValues;
  /** Short query-string key per field, e.g. { length: 'l', depth: 'd' }. */
  readonly params: ParamMap;
  /** What each numeric field measures, for unit conversion. */
  readonly kinds: Readonly<Record<string, FieldKind>>;
  /**
   * Transforms values parsed from a shared link before use, e.g. to migrate
   * legacy URL semantics. Receives the raw parsed values and the link's unit
   * system (null if the link carried none).
   */
  readonly migrateSearchValues?: (
    values: ToolValues,
    units: UnitSystem | null,
  ) => ToolValues;
  /**
   * Param keys always written to generated URLs, even when matching defaults.
   * For URL version markers: ensures the address bar, copy links, unit
   * switches, and resets all carry the marker.
   */
  readonly alwaysIncludeParams?: string[];
};

export type ToolState = {
  readonly values: ToolValues;
  readonly units: UnitSystem;
  /** True once the browser values have been read. */
  readonly ready: boolean;
  readonly setValue: (field: string, value: string) => void;
  readonly setUnits: (units: UnitSystem) => void;
  readonly reset: () => void;
  /**
   * The current inputs as a full, absolute link, built when the reader asks for
   * it rather than mirrored into the address bar as they type.
   */
  readonly shareUrl: () => string;
};

/** Reads a field as a number. An empty or non-numeric field reads as NaN. */
export function num(values: ToolValues, field: string): number {
  const raw = values[field];
  if (raw === undefined || raw.trim() === '') return Number.NaN;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

/** Formats a converted number for display without a trail of decimals. */
function display(value: number): string {
  if (!Number.isFinite(value)) return '';
  return String(toSignificant(value, 4));
}

/**
 * Formats a converted number for state storage, preserving enough precision
 * that calculations (including discrete ceil/roundUp boundaries) are not
 * affected by the conversion.
 *
 * 4 significant figures (display) can err by 5e-4 relative, which flips a
 * truck-load ceiling when the true ratio sits near an integer. 10 figures
 * err by 5e-10 relative — far below the 5e-7 absolute tolerance that
 * roundUp()'s 6-decimal pre-rounding absorbs — so repeated toggles neither
 * change discrete results nor accumulate drift.
 *
 * The input shows the stored string; common values (6.096, 3.048) render
 * cleanly, and longer ones trade a few digits for correctness.
 */
function displayPrecise(value: number): string {
  if (!Number.isFinite(value)) return '';
  return String(toSignificant(value, 10));
}

/**
 * Converts a single field value string across unit systems, preserving
 * precision for state storage. Exported for regression testing.
 */
export function convertFieldForUnits(
  value: string,
  kind: FieldKind,
  to: UnitSystem,
): string {
  const trimmed = value.trim();
  if (kind === 'none' || trimmed === '') return value;
  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric)) return value;
  return displayPrecise(convert(numeric, kind, to));
}

/**
 * Holds a tool's inputs, converts them when the reader switches units, and
 * keeps a shareable link of them.
 *
 * The state is composed rather than copied about: defaults for the current
 * unit system, overlaid with anything the shared link carried, overlaid with
 * what the reader has since typed. That means no effect has to copy the URL
 * into state, which would cost a cascading render on every page load.
 *
 * The address bar is written only after the reader changes something, only for
 * values that differ from the defaults, and only once typing pauses. A page
 * that has just loaded keeps the clean URL it was opened with.
 */
export function useToolState(options: ToolStateOptions): ToolState {
  const { imperialDefaults, metricDefaults, params, kinds, migrateSearchValues, alwaysIncludeParams } = options;
  const [units, setUnitsPreference] = useUnits();
  const search = useCapturedBrowserValue(readInitialSearch);

  // What the reader has typed, and whether Reset has discarded the link values.
  const [edits, setEdits] = useState<ToolValues>({});
  const [ignoreSearch, setIgnoreSearch] = useState(false);
  // False until the reader changes something, which is what keeps the URL clean
  // on load. Reset counts as a change, so it can clear the query string again.
  const [touched, setTouched] = useState(false);
  const appliedUnits = useRef<UnitSystem | null>(null);

  const defaultsFor = useCallback(
    (system: UnitSystem): ToolValues => {
      if (system === 'imperial') return imperialDefaults;
      if (metricDefaults) return metricDefaults;
      const converted: ToolValues = {};
      for (const [field, value] of Object.entries(imperialDefaults)) {
        const kind = kinds[field] ?? 'none';
        const numeric = Number(value);
        converted[field] =
          kind === 'none' || !Number.isFinite(numeric)
            ? value
            : display(convert(numeric, kind, 'metric'));
      }
      return converted;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /** Values the shared link carried, and the unit system it was shared in. */
  const fromSearch = useMemo(() => {
    const parsed = parseQuery(search, params);
    const values = migrateSearchValues ? migrateSearchValues(parsed.values, parsed.units) : parsed.values;
    return { values, units: parsed.units };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // A link shared in metric opens in metric, whatever the local preference.
  const sharedUnits = ignoreSearch ? null : fromSearch.units;
  const effectiveUnits: UnitSystem = sharedUnits ?? units;

  const defaults = useMemo(() => defaultsFor(effectiveUnits), [defaultsFor, effectiveUnits]);

  /** Only the fields the reader or the shared link actually set. */
  const explicit = useMemo(
    () => ({ ...(ignoreSearch ? {} : fromSearch.values), ...edits }),
    [ignoreSearch, fromSearch, edits],
  );

  const values = useMemo(() => ({ ...defaults, ...explicit }), [defaults, explicit]);

  // Adopt the shared link's unit system as the stored preference, once.
  useEffect(() => {
    if (sharedUnits && sharedUnits !== units) {
      setUnitsPreference(sharedUnits);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedUnits]);

  // Mirror the changed inputs into the query string, once typing pauses.
  // replaceState rather than the router, so neither the back button nor a
  // re-render is involved.
  useEffect(() => {
    if (!touched) return;
    const timer = window.setTimeout(() => {
      const query = buildQuery({
        values,
        defaults,
        params,
        units: effectiveUnits,
        alwaysInclude: alwaysIncludeParams,
      });
      window.history.replaceState(null, '', pathWithQuery(window.location.pathname, query));
    }, URL_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [touched, values, defaults, effectiveUnits]);

  const setValue = useCallback((field: string, value: string) => {
    setTouched(true);
    setEdits((current) => ({ ...current, [field]: value }));
  }, []);

  const setUnits = useCallback(
    (next: UnitSystem) => {
      const from = appliedUnits.current ?? effectiveUnits;
      if (next === from) return;
      appliedUnits.current = next;
      setTouched(true);
      setUnitsPreference(next);
      // Convert every current value so the physical quantity is preserved.
      // Previously only explicitly-touched fields were converted; untouched
      // fields fell back to the other system's defaults, which are rounded
      // for readability (20 ft -> 6 m instead of 6.096 m) and silently
      // changed the result by ~5% on bulk soil.
      setEdits(() => {
        const converted: ToolValues = {};
        const current: ToolValues = { ...defaultsFor(from), ...explicit };
        const targetDefaults = defaultsFor(next);
        for (const [field, raw] of Object.entries(current)) {
          const kind = kinds[field] ?? 'none';
          const value = raw.trim();
          if (kind === 'none' || value === '') {
            // Non-quantities (modes, materials, selects) and emptied fields
            // carry over only if explicitly set; untouched ones fall back to
            // the target defaults.
            if (field in explicit) converted[field] = raw;
            continue;
          }
          const numeric = Number(value);
          if (!Number.isFinite(numeric)) {
            if (field in explicit) converted[field] = raw;
            continue;
          }
          const newValue = convertFieldForUnits(raw, kind, next);
          // Omit untouched fields whose converted value matches the target
          // default, keeping a bare toggle's URL clean. Converted values that
          // differ (the common case, since defaults are rounded) are carried
          // over so the quantity — and the result — is unchanged.
          if (field in explicit || newValue !== targetDefaults[field]) {
            converted[field] = newValue;
          }
        }
        return converted;
      });
      setIgnoreSearch(true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [explicit, effectiveUnits],
  );

  const reset = useCallback(() => {
    setTouched(true);
    setEdits({});
    setIgnoreSearch(true);
  }, []);

  // Spelled out in full, unlike the address bar: a link someone keeps should
  // still mean the same thing if a default changes later.
  const shareUrl = useCallback(() => {
    const query = buildQuery({
      values,
      defaults,
      params,
      units: effectiveUnits,
      includeAll: true,
      alwaysInclude: alwaysIncludeParams,
    });
    return `${window.location.origin}${pathWithQuery(window.location.pathname, query)}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, defaults, effectiveUnits]);

  return { values, units: effectiveUnits, ready: true, setValue, setUnits, reset, shareUrl };
}
