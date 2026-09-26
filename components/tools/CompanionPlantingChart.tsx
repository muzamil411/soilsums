'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { SelectField } from '@/components/ui/SelectField';
import { useToolState } from '@/lib/hooks/useToolState';
import { crops, type Crop } from '@/data/crops';
import {
  chartFor,
  CONFIDENCE_NOTE,
  type ChartEntry,
  type Confidence,
} from '@/lib/content/companions';
import type { ToolProps } from './registry';

/**
 * Pick a crop, see what goes near it and what does not, with the reason in both
 * directions.
 *
 * Every row is generated from data/crops.ts through lib/content/companions.ts,
 * so it cannot disagree with the crop pages. The confidence label is the whole
 * point: most of what is published as companion planting is traditional lore,
 * and a chart that prints lore and fact in the same typeface is the problem
 * rather than the answer.
 */

// A lookup rather than a calculation, so there are no units to convert and no
// metric variant of the defaults — only the shareable crop in the query string.
const DEFAULTS = { crop: 'tomato' };

/**
 * Only crops with a published guide, so every name in the picker can be clicked.
 *
 * The list arrives as a prop rather than being read here: this is a client
 * component and the published set comes from the content directory, which only
 * the server can read. Importing the MDX registry to find out crashed the build
 * with `node:fs` reaching the browser bundle, which is exactly what ToolProps
 * exists to prevent.
 */
function chartCrops(linked: readonly string[] | undefined): readonly Crop[] {
  const live = new Set(linked ?? crops.map((crop) => crop.slug));
  return crops
    .filter((crop) => live.has(crop.slug))
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));
}

const BADGE: Record<Confidence, string> = {
  supported: 'bg-kale text-paper',
  plausible: 'bg-ochre text-ink',
  traditional: 'border-ink/30 text-ink/80 border',
};

const BADGE_LABEL: Record<Confidence, string> = {
  supported: 'Supported',
  plausible: 'Plausible',
  traditional: 'Tradition only',
};

function Row({ entry }: { entry: ChartEntry }) {
  return (
    <li className="border-rule border-t py-3 first:border-t-0">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-display text-base">
          {entry.slug ? (
            <Link href={`/crops/${entry.slug}/`} className="underline">
              {entry.name}
            </Link>
          ) : (
            entry.name
          )}
        </span>
        <span
          className={`px-1.5 py-0.5 text-[0.7rem] tracking-wide uppercase ${BADGE[entry.reason.confidence]}`}
        >
          {BADGE_LABEL[entry.reason.confidence]}
        </span>
        <span className="text-ink/70 text-xs">{entry.reason.mechanism}</span>
      </div>
      <p className="text-ink/90 mt-1 text-sm">{entry.reason.text}</p>
    </li>
  );
}

export function CompanionPlantingChart({ linkedCrops }: ToolProps) {
  const { values, setValue } = useToolState({
    imperialDefaults: DEFAULTS,
    metricDefaults: DEFAULTS,
    params: { crop: 'c' },
    // Not a measurement, so nothing to convert when the reader switches units.
    kinds: { crop: 'none' },
  });
  const available = useMemo(() => chartCrops(linkedCrops), [linkedCrops]);
  const slug = typeof values.crop === 'string' && values.crop ? values.crop : 'tomato';
  const crop = available.find((candidate) => candidate.slug === slug) ?? available[0];

  if (!crop) return null;
  const chart = chartFor(crop);
  const counts = [...chart.good, ...chart.avoid].reduce<Record<string, number>>((acc, entry) => {
    acc[entry.reason.confidence] = (acc[entry.reason.confidence] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="border-ink/20 border">
      <div className="bg-kale text-paper flex items-baseline justify-between px-3 py-2">
        <h2 className="font-display text-sm">Companion planting chart</h2>
        <span aria-hidden="true" className="bg-radish h-2 w-8" />
      </div>

      <div className="border-rule border-b px-3 py-3">
        <SelectField
          label="Pick a crop"
          value={crop.slug}
          onChange={(next) => setValue('crop', next)}
          options={available.map((candidate) => ({ value: candidate.slug, label: candidate.name }))}
        />
        <p className="text-ink/70 mt-2 text-xs">
          {crop.name} is {crop.family}.{' '}
          {counts.traditional
            ? `${counts.traditional} of the ${chart.good.length + chart.avoid.length} pairings below rest on tradition alone.`
            : 'Every pairing below has a mechanism behind it.'}
        </p>
      </div>

      <div className="grid gap-0 sm:grid-cols-2">
        <div className="border-rule border-b px-3 py-3 sm:border-r sm:border-b-0">
          <h3 className="font-display text-lg">Plant near {crop.name.toLowerCase()}</h3>
          {chart.good.length > 0 ? (
            <ul className="mt-2">
              {chart.good.map((entry) => (
                <Row key={entry.name} entry={entry} />
              ))}
            </ul>
          ) : (
            <p className="text-ink/80 mt-2 text-sm">
              No pairings are recorded for this crop. That is an absence of claims rather than a
              recommendation to grow it alone.
            </p>
          )}
        </div>

        <div className="px-3 py-3">
          <h3 className="font-display text-lg">Keep away from {crop.name.toLowerCase()}</h3>
          {chart.avoid.length > 0 ? (
            <ul className="mt-2">
              {chart.avoid.map((entry) => (
                <Row key={entry.name} entry={entry} />
              ))}
            </ul>
          ) : (
            <p className="text-ink/80 mt-2 text-sm">
              Nothing. No publication or tradition we have found names a plant to keep away from{' '}
              {crop.name.toLowerCase()}, which for an easy-going crop is the honest answer rather
              than a gap.
            </p>
          )}
        </div>
      </div>

      <dl className="border-rule border-t px-3 py-3 text-xs">
        {(['supported', 'plausible', 'traditional'] as const).map((level) => (
          <div key={level} className="mt-1 first:mt-0">
            <dt className="inline">
              <span className={`px-1.5 py-0.5 tracking-wide uppercase ${BADGE[level]}`}>
                {BADGE_LABEL[level]}
              </span>
            </dt>{' '}
            <dd className="text-ink/75 inline">{CONFIDENCE_NOTE[level]}</dd>
          </div>
        ))}
      </dl>

      <p className="border-rule text-ink/70 border-t px-3 py-2 text-xs">
        Generated from the crop data behind every guide on this site, so this chart and the{' '}
        <Link href={`/crops/${crop.slug}/`}>{crop.name.toLowerCase()} guide</Link> can never
        disagree. Spacing, sun and water do far more for a crop than its neighbours do.
      </p>
    </div>
  );
}
