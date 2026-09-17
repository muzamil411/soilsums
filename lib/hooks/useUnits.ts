'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { UnitSystem } from '@/lib/calculators/shared/units';
import { readLocalStorage, writeLocalStorage } from './useBrowserValue';

const STORAGE_KEY = 'soilsums.units';
const DEFAULT: UnitSystem = 'imperial';

/**
 * The reader's imperial or metric preference, shared by every tool and
 * remembered between visits.
 *
 * Held in a tiny module-level store read through useSyncExternalStore, so the
 * static HTML renders the imperial default and the stored preference applies
 * immediately after hydration — without an effect that sets state.
 */
const listeners = new Set<() => void>();
let snapshot: UnitSystem | null = null;

function parse(raw: string): UnitSystem | null {
  return raw === 'imperial' || raw === 'metric' ? raw : null;
}

function getSnapshot(): UnitSystem {
  if (snapshot === null) {
    snapshot = parse(readLocalStorage(STORAGE_KEY)) ?? DEFAULT;
  }
  return snapshot;
}

function getServerSnapshot(): UnitSystem {
  return DEFAULT;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function store(units: UnitSystem): void {
  snapshot = units;
  writeLocalStorage(STORAGE_KEY, units);
  for (const listener of listeners) {
    listener();
  }
}

export function useUnits(): [UnitSystem, (units: UnitSystem) => void] {
  const units = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setUnits = useCallback((next: UnitSystem) => store(next), []);
  return [units, setUnits];
}
