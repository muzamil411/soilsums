'use client';

import { useMemo } from 'react';
import { CalculatorFrame } from './CalculatorFrame';
import { errorMap } from './errors';
import { NumberField } from '@/components/ui/NumberField';
import { SelectField } from '@/components/ui/SelectField';
import { num, useToolState, type FieldKind } from '@/lib/hooks/useToolState';
import { calculateLime } from '@/lib/calculators/lime';
import {
  COLORADO,
  LIME_RATE_SOURCE,
  SINGLE_APPLICATION_LIMIT_LB_PER_1000SQFT,
  limeRates,
  type SoilTexture,
} from '@/data/lime-rates';

const PARAMS = { area: 'a', currentPh: 'cp', targetPh: 'tp', texture: 'tx' } as const;
const KINDS: Record<string, FieldKind> = { area: 'area' };
const IMPERIAL = { area: '400', currentPh: '5.5', targetPh: '6.5', texture: 'loam' };

/** An ochre-ruled callout, the same shape the soil-test notice already uses. */
function Callout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-ochre bg-paper border-l-4 py-3 pr-3 pl-4">
      <p className="font-display text-ochre text-base">{title}</p>
      <div className="text-ink/90 mt-1 space-y-2 text-sm">{children}</div>
    </div>
  );
}

export function LimeCalculator({ toolSlug }: { toolSlug: string }) {
  const { values, units, setValue, setUnits, reset, shareUrl } = useToolState({
    imperialDefaults: IMPERIAL,
    params: PARAMS,
    kinds: KINDS,
  });

  const imperial = units === 'imperial';
  const texture = (limeRates.map((rate) => rate.slug) as string[]).includes(values.texture ?? '')
    ? (values.texture as SoilTexture)
    : 'loam';

  const result = useMemo(
    () =>
      calculateLime({
        units,
        area: num(values, 'area'),
        currentPh: num(values, 'currentPh'),
        targetPh: num(values, 'targetPh'),
        texture,
      }),
    [units, values, texture],
  );

  const errors = errorMap(result, values);
  const output = result.ok ? result.value : null;
  const headline = output ? (imperial ? output.pounds : output.kilograms) : null;
  const selected = limeRates.find((rate) => rate.slug === texture);

  const unit = imperial ? 'lb' : 'kg';
  const range = output ? (imperial ? output.poundsRange : output.kilogramsRange) : null;
  const perApplication = output
    ? imperial
      ? output.poundsPerApplication
      : output.kilogramsPerApplication
    : null;
  const mustSplit = output !== null && output.applications > 1;
  // The rate, in whichever units the reader is working in. The limits quoted
  // below are published per 1,000 sq ft, so those stay imperial either way.
  const rate = output
    ? imperial
      ? `${output.lbPer1000SqFt} lb per 1,000 sq ft`
      : `${output.kgPer100SqM} kg per 100 m²`
    : null;

  return (
    <CalculatorFrame
      toolSlug={toolSlug}
      units={units}
      onUnitsChange={setUnits}
      shareUrl={shareUrl}
      onReset={reset}
      headline={headline === null ? null : String(headline)}
      headlineUnit={imperial ? 'lb of limestone' : 'kg of limestone'}
      sentence={
        output && range ? (
          <>
            <p>
              About{' '}
              <strong>
                {headline} {unit}
              </strong>{' '}
              of ground limestone (range {range[0]}–{range[1]} {unit}) to move {texture} soil from
              pH {values.currentPh} to pH {values.targetPh} over{' '}
              {imperial
                ? `${output.areaSquareFeet} square feet`
                : `${output.areaSquareMeters} square meters`}{' '}
              — that is {rate}. The range is the published spread for this texture, not a rounding:
              your own soil can sit anywhere in it.
            </p>
            <p className="text-ink/75 mt-2 text-sm">
              Assumes ground agricultural limestone, calcitic or dolomitic, worked into the top 6
              inches of a mineral soil low in organic matter. Expect six months to a year before the
              pH has fully moved.
            </p>
          </>
        ) : null
      }
      copyText={
        output && range
          ? `${output.pounds} lb (range ${output.poundsRange[0]}-${output.poundsRange[1]} lb) of ground limestone to raise ${texture} soil ${output.phChange} pH units over ${output.areaSquareFeet} sq ft, at ${output.lbPer1000SqFt} lb per 1,000 sq ft. Calculated at soilsums.com`
          : ''
      }
      notes={output ? output.warnings : []}
      extra={
        <div className="space-y-4">
          {mustSplit && output && perApplication !== null ? (
            <Callout title={`Split this across ${output.applications} applications`}>
              <p>
                At {output.lbPer1000SqFt} lb per 1,000 sq ft this is above the{' '}
                {SINGLE_APPLICATION_LIMIT_LB_PER_1000SQFT} lb per 1,000 sq ft that Penn State
                Extension sets as the ceiling for a single application on turf. Put down about{' '}
                {perApplication} {unit} in spring and the same again in autumn, four to six months
                apart, rather than all of it at once.
              </p>
              <p>
                Colorado State University Extension is stricter still on established turf, advising
                no more than {COLORADO.establishedTurfLimitLbPer1000SqFt} lb per 1,000 sq ft in one
                go. If you are liming an existing lawn rather than a bare bed, work to that lower
                figure.
              </p>
            </Callout>
          ) : null}

          <div className="border-rule border-t pt-4">
            <p className="text-sm font-semibold">Two things that change the rate</p>
            <ul className="text-ink/90 mt-2 space-y-2 text-sm">
              <li>
                <strong>High organic matter needs more.</strong> Organic matter buffers pH much as
                clay does. Colorado State University Extension suggests increasing the rate by about{' '}
                {Math.round(COLORADO.organicMatterUplift * 100)}% where organic matter runs 4–5%, so
                a well-composted bed will want more lime than this figure, not less.
              </li>
              <li>
                <strong>Hydrated and burned lime are not this product.</strong> They are caustic and
                act fast, and the rate above does not apply to them. Colorado advises halving the
                rate and applying no more than {COLORADO.hydratedLimeLimitLbPer1000SqFt} lb per
                1,000 sq ft. Ground or pelletised limestone is the safer choice for a garden.
              </li>
            </ul>
          </div>

          <Callout title="A soil test beats this calculator">
            <p>
              Published rates for the same soil texture vary several-fold between regions, because
              the soils behind them do. Kentucky publishes a rate per pH unit by texture; Colorado
              publishes a ceiling on what is safe in one application and no texture table at all.
              Those cannot be reconciled into one number, and this calculator has to pick one. That
              regional spread — not a general disclaimer — is why the figure above is a starting
              point.
            </p>
            <p>
              What decides the answer for your soil is its buffering capacity, which a pH reading
              cannot show: two soils reading pH 5.5 can need very different amounts. A test
              reporting <strong>buffer pH</strong>, or a direct recommendation from your own
              extension service, is the only accurate basis. Lime is slow and hard to undo, so
              under-apply, retest next season, and top up.
            </p>
          </Callout>

          <p className="text-ink/75 text-xs">
            Rates from {LIME_RATE_SOURCE.label},{' '}
            <a href={LIME_RATE_SOURCE.url} rel="nofollow">
              {LIME_RATE_SOURCE.title}
            </a>{' '}
            ({LIME_RATE_SOURCE.year}), {LIME_RATE_SOURCE.detail}.
          </p>
        </div>
      }
    >
      <NumberField
        label="Area to treat"
        value={values.area ?? ''}
        onChange={(value) => setValue('area', value)}
        suffix={imperial ? 'sq ft' : 'm²'}
        error={errors.area}
      />

      <SelectField
        label="Soil texture"
        value={texture}
        onChange={(value) => setValue('texture', value)}
        options={limeRates.map((rate) => ({ value: rate.slug, label: rate.name }))}
        hint={selected?.description}
      />

      <NumberField
        label="Current pH"
        value={values.currentPh ?? ''}
        onChange={(value) => setValue('currentPh', value)}
        error={errors.currentPh}
        hint="From a soil test or a meter"
      />

      <NumberField
        label="Target pH"
        value={values.targetPh ?? ''}
        onChange={(value) => setValue('targetPh', value)}
        error={errors.targetPh}
        hint="Most vegetables are happy between 6.0 and 6.8"
      />
    </CalculatorFrame>
  );
}
