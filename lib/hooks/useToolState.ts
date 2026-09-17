'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  KG_PER_100SQM_TO_LB_PER_1000SQFT,
  LITERS_PER_CUBIC_FOOT,
  MM_PER_INCH,
  US_DRY_QUARTS_PER_CUBIC_FOOT,
  centimetersToInches,
  cubicFeetToLiters,
  feetToMeters,
  inchesToCentimeters,
  kilogramsToPounds,
  lbPer1000SqFtToKgPer100SqM,
  metersToFeet,
  poundsToKilograms,
  squareFeetToSquareMeters,
  squareMetersToSquareFeet,
  type UnitSystem,
} from '@/lib/calculators/shared/units';
import { toSignificant } from '@/lib/calculators/shared/round';
import { readInitialSearch, useCapturedBrowserValue } from './useBrowserValue';
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
  }
}

/**
 * Field values are held as strings, because that is what an input holds. An
 * empty string is a genuinely empty field and must not silently become zero.
 */
export type ToolValues = Record<string, string>;

export type ToolStateOptions = {
  /** Defaults for imperial, which is what the tool opens with. */
  readonly imperialDefaults: ToolValues;
  /** Defaults for metric, so a metric reader gets round numbers too. */
  readonly metricDefaults?: ToolValues;
  /** Short query-string key per field, e.g. { length: 'l', depth: 'd' }. */
  readonly params: Readonly<Record<string, string>>;
  /** What each numeric field measures, for unit conversion. */
  readonly kinds: Readonly<Record<string, FieldKind>>;
};

export type ToolState = {
  readonly values: ToolValues;
  readonly units: UnitSystem;
  /** True once the browser values have been read. */
  readonly ready: boolean;
  readonly setValue: (field: string, value: string) => void;
  readonly setUnits: (units: UnitSystem) => void;
  readonly reset: () => void;
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
 * Holds a tool's inputs, keeps them in the page address so a result can be
 * shared, and converts them when the reader switches units.
 *
 * The state is composed rather than copied about: defaults for the current
 * unit system, overlaid with anything the shared link carried, overlaid with
 * what the reader has since typed. That means no effect has to copy the URL
 * into state, which would cost a cascading render on every page load.
 */
export function useToolState(options: ToolStateOptions): ToolState {
  const { imperialDefaults, metricDefaults, params, kinds } = options;
  const [units, setUnitsPreference] = useUnits();
  const search = useCapturedBrowserValue(readInitialSearch);

  // What the reader has typed, and whether Reset has discarded the link values.
  const [edits, setEdits] = useState<ToolValues>({});
  const [ignoreSearch, setIgnoreSearch] = useState(false);
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
    const query = new URLSearchParams(search);
    const values: ToolValues = {};
    for (const [field, key] of Object.entries(params)) {
      const raw = query.get(key);
      if (raw !== null) values[field] = raw;
    }
    const shared = query.get('u');
    const sharedUnits: UnitSystem | null =
      shared === 'metric' || shared === 'imperial' ? shared : null;
    return { values, units: sharedUnits };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // A link shared in metric opens in metric, whatever the local preference.
  const sharedUnits = ignoreSearch ? null : fromSearch.units;
  const effectiveUnits: UnitSystem = sharedUnits ?? units;

  const values = useMemo(
    () => ({
      ...defaultsFor(effectiveUnits),
      ...(ignoreSearch ? {} : fromSearch.values),
      ...edits,
    }),
    [defaultsFor, effectiveUnits, ignoreSearch, fromSearch, edits],
  );

  // Adopt the shared link's unit system as the stored preference, once.
  useEffect(() => {
    if (sharedUnits && sharedUnits !== units) {
      setUnitsPreference(sharedUnits);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedUnits]);

  // Mirror the current inputs into the query string. replaceState rather than
  // the router, so typing neither pushes history entries nor re-renders.
  useEffect(() => {
    const query = new URLSearchParams();
    for (const [field, key] of Object.entries(params)) {
      const value = values[field];
      if (value !== undefined && value !== '') query.set(key, value);
    }
    query.set('u', effectiveUnits);
    const encoded = query.toString();
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${encoded ? `?${encoded}` : ''}`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, effectiveUnits]);

  const setValue = useCallback((field: string, value: string) => {
    setEdits((current) => ({ ...current, [field]: value }));
  }, []);

  const setUnits = useCallback(
    (next: UnitSystem) => {
      const from = appliedUnits.current ?? effectiveUnits;
      if (next === from) return;
      appliedUnits.current = next;
      setUnitsPreference(next);
      // Every field becomes an edit, converted, so the quantities are unchanged.
      setEdits(() => {
        const converted: ToolValues = {};
        for (const [field, value] of Object.entries(values)) {
          const kind = kinds[field] ?? 'none';
          if (kind === 'none' || value.trim() === '') {
            converted[field] = value;
            continue;
          }
          const numeric = Number(value);
          converted[field] = Number.isFinite(numeric)
            ? display(convert(numeric, kind, next))
            : value;
        }
        return converted;
      });
      setIgnoreSearch(true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, effectiveUnits],
  );

  const reset = useCallback(() => {
    setEdits({});
    setIgnoreSearch(true);
  }, []);

  return { values, units: effectiveUnits, ready: true, setValue, setUnits, reset };
}
