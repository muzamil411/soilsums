'use client';

import { useCallback, useRef, useSyncExternalStore } from 'react';

const noopSubscribe = () => () => {};

/**
 * Reads a browser-only value — the query string, a saved plan — in a way that
 * is safe across hydration and does not set state inside an effect.
 *
 * The static HTML has no query string and no localStorage, so the first render
 * must use the server value or React will complain about a mismatch. Rather
 * than render defaults and then correct them from an effect, which triggers a
 * cascading render, this reads through `useSyncExternalStore`: React renders
 * the server snapshot for the static markup, then the client snapshot straight
 * after hydration.
 *
 * The value is captured once, on first read, and never changes afterwards.
 * That is exactly what is wanted here: a shared link supplies the starting
 * values, and after that the user's edits are the source of truth. It also
 * means our own history.replaceState calls cannot feed back into state.
 */
export function useCapturedBrowserValue(read: () => string, serverValue = ''): string {
  const captured = useRef<string | null>(null);

  const getSnapshot = useCallback(() => {
    if (captured.current === null) {
      captured.current = read();
    }
    return captured.current;
    // `read` is a stable module-level function in every caller.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getServerSnapshot = useCallback(() => serverValue, [serverValue]);

  return useSyncExternalStore(noopSubscribe, getSnapshot, getServerSnapshot);
}

/** The query string as it was when the page loaded. */
export function readInitialSearch(): string {
  return window.location.search;
}

/** A localStorage value, or an empty string if storage is unavailable. */
export function readLocalStorage(key: string): string {
  try {
    return window.localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

/** Writes to localStorage, ignoring a blocked or full store. */
export function writeLocalStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Not remembered, but nothing breaks.
  }
}
