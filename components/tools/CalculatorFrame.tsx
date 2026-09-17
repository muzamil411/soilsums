'use client';

import { useEffect, type ReactNode } from 'react';
import { CopyButton } from '@/components/ui/CopyButton';
import { UnitToggle } from '@/components/ui/UnitToggle';
import { trackCalculatorUsed } from '@/lib/analytics';
import type { UnitSystem } from '@/lib/calculators/shared/units';

/**
 * The frame every calculator sits in: the garden-notebook panel, the unit
 * toggle, the result, and the copy, print and reset actions.
 *
 * There is no submit button — the result updates as the reader types. When the
 * input is not yet valid the result area shows what is missing rather than a
 * number, so `NaN` never reaches the page.
 */
export function CalculatorFrame({
  toolSlug,
  units,
  onUnitsChange,
  onReset,
  headline,
  headlineUnit,
  sentence,
  copyText,
  notes = [],
  waitingMessage,
  resultFirst = false,
  inputsLabel = 'Your measurements',
  extra,
  children,
}: {
  toolSlug: string;
  units: UnitSystem;
  onUnitsChange: (units: UnitSystem) => void;
  onReset: () => void;
  /** The big number, or null while the input is incomplete or invalid. */
  headline: string | null;
  headlineUnit?: string;
  sentence?: ReactNode;
  copyText: string;
  notes?: readonly string[];
  waitingMessage?: string;
  /**
   * Puts the result above the inputs instead of below them. Used by the tools
   * whose input is a list or a grid rather than a fixed set of fields: there is
   * no settled place "after the inputs" when rows can be added, and keeping the
   * running total at the top means it stays visible while the list is edited.
   */
  resultFirst?: boolean;
  /** Heading above the fields. "Your measurements" does not fit every tool. */
  inputsLabel?: string;
  /** Breakdown tables and secondary figures, below the sentence. */
  extra?: ReactNode;
  children: ReactNode;
}) {
  const valid = headline !== null;

  useEffect(() => {
    if (valid) {
      trackCalculatorUsed(toolSlug);
    }
  }, [valid, toolSlug]);

  // Points at wherever the fields actually are for this layout.
  const waiting =
    waitingMessage ??
    (resultFirst
      ? 'Fill in the fields below to see your result.'
      : 'Fill in the fields above to see your result.');

  const resultBlock = (
    <>
      {/* A double rule marks the boundary between question and answer. */}
      <div
        aria-hidden="true"
        className={`border-ink/70 border-t-4 border-double ${resultFirst ? 'mb-4' : 'mt-6'}`}
      />

      <div className={resultFirst ? '' : 'mt-4'} aria-live="polite">
        {valid ? (
          <>
            <p className="font-display text-ink tabular text-4xl leading-none sm:text-5xl">
              {headline}
              {headlineUnit ? (
                <span className="font-sans text-xl font-normal"> {headlineUnit}</span>
              ) : null}
            </p>
            <div aria-hidden="true" className="bg-radish mt-2 h-1 w-24" />
            {sentence ? <div className="mt-3 max-w-prose text-base">{sentence}</div> : null}
          </>
        ) : (
          <p className="text-ink/75 text-base">{waiting}</p>
        )}
      </div>

      {notes.length > 0 ? (
        <ul className="border-ochre mt-4 space-y-2 border-l-4 pl-3">
          {notes.map((note) => (
            <li key={note} className="text-ochre text-sm">
              {note}
            </li>
          ))}
        </ul>
      ) : null}

      {resultFirst ? (
        <div aria-hidden="true" className="border-ink/70 mt-4 mb-5 border-t-4 border-double" />
      ) : null}
    </>
  );

  const inputs = <div className="grid grid-cols-2 gap-x-3 gap-y-4">{children}</div>;

  return (
    <div className="graph-paper border-ink/20 border p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{inputsLabel}</p>
        <UnitToggle units={units} onChange={onUnitsChange} />
      </div>

      {resultFirst ? (
        <>
          {resultBlock}
          {inputs}
          {extra ? <div className="mt-5">{extra}</div> : null}
        </>
      ) : (
        <>
          {inputs}
          {resultBlock}
          {extra ? <div className="mt-5">{extra}</div> : null}
        </>
      )}

      <div className="no-print mt-6 flex flex-wrap gap-2">
        <CopyButton text={copyText} disabled={!valid} />
        <button
          type="button"
          onClick={() => window.print()}
          className="border-kale text-kale border-2 px-3 py-1.5 text-sm font-semibold"
        >
          Print
        </button>
        <button
          type="button"
          onClick={onReset}
          className="border-radish text-radish border-2 px-3 py-1.5 text-sm font-semibold"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
