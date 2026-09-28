'use client';

import { useMemo } from 'react';
import { CalculatorFrame } from './CalculatorFrame';
import { errorMap } from './errors';
import { NumberField } from '@/components/ui/NumberField';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { SelectField } from '@/components/ui/SelectField';
import { num, useToolState, type FieldKind } from '@/lib/hooks/useToolState';
import { rateLabel } from '@/data/turfgrass';
import { calculateGrassSeed, type SeedingPurpose } from '@/lib/calculators/grass-seed';
import {
  G_PER_SQM_PER_LB_PER_1000SQFT,
  PLS_NOTE,
  POOR_CONDITIONS_UPLIFT,
  grassSeedRates,
} from '@/data/grass-seed-rates';
import { Estimate } from '@/components/ui/Estimate';

const PARAMS = { area: 'a', grass: 'g', purpose: 'pu' } as const;
const KINDS: Record<string, FieldKind> = { area: 'area' };
const IMPERIAL = { area: '5000', grass: 'tall-fescue', purpose: 'new-lawn' };

export function GrassSeedCalculator({ toolSlug }: { toolSlug: string }) {
  const { values, units, setValue, setUnits, reset, shareUrl } = useToolState({
    imperialDefaults: IMPERIAL,
    params: PARAMS,
    kinds: KINDS,
  });

  const imperial = units === 'imperial';
  const purpose: SeedingPurpose = values.purpose === 'overseed' ? 'overseed' : 'new-lawn';

  const result = useMemo(
    () =>
      calculateGrassSeed({
        units,
        area: num(values, 'area'),
        grassSlug: values.grass ?? '',
        purpose,
      }),
    [units, values, purpose],
  );

  const errors = errorMap(result, values);
  const output = result.ok ? result.value : null;
  const headline = output ? (imperial ? output.pounds : output.kilograms) : null;

  return (
    <CalculatorFrame
      toolSlug={toolSlug}
      units={units}
      onUnitsChange={setUnits}
      shareUrl={shareUrl}
      onReset={reset}
      headline={headline === null ? null : String(headline)}
      headlineUnit={imperial ? 'lb of seed' : 'kg of seed'}
      sentence={
        output ? (
          <p>
            Buy about{' '}
            <strong>
              {imperial ? `${output.pounds} pounds` : `${output.kilograms} kilograms`}
            </strong>{' '}
            of {output.grassName.toLowerCase()} seed for{' '}
            {imperial
              ? `${output.areaSquareFeet} square feet`
              : `${output.areaSquareMeters} square meters`}
            . That is the {purpose === 'new-lawn' ? 'full establishment' : 'overseeding'} rate of{' '}
            {output.rateLbPer1000SqFt} lb per 1,000 sq ft
            {imperial ? '' : ` (${output.rateKgPer100SqM} kg per 100 m²)`}
            {output.rateVerified ? null : (
              <Estimate
                what={`the ${purpose === 'new-lawn' ? 'establishment' : 'overseeding'} rate for ${output.grassName.toLowerCase()}`}
              />
            )}
            .{' '}
            {/* A midpoint is arithmetic on a published range, not a
                recommendation of its own, and the page has to say which it is
                showing. */}
            {output.rateIsMidpoint
              ? `That figure is the midpoint of ${output.newLawnBasis}'s published ${rateLabel(output.newLawnRange)} per 1,000 sq ft, not a recommendation of its own. `
              : ''}
            Sow half in one direction and half at right angles to it — that covers the gaps a single
            pass leaves.
          </p>
        ) : null
      }
      copyText={
        output
          ? `${output.pounds} lb (${output.kilograms} kg) of ${output.grassName} seed for ${output.areaSquareFeet} sq ft. Calculated at soilsums.com`
          : ''
      }
      notes={output ? [output.note] : []}
      extra={
        output ? (
          <div className="space-y-4">
            {output.rateVerified ? null : (
              <div className="border-ochre bg-paper border-l-4 py-3 pr-3 pl-4">
                <p className="font-display text-ochre text-base">
                  This rate is an estimate, not a sourced figure
                </p>
                <p className="text-ink/90 mt-1 text-sm">
                  No extension service publishes an overseeding rate for{' '}
                  {output.grassName.toLowerCase()} that could be opened and checked. The figure
                  above is a typical published value, kept because the tool needs one rather than an
                  empty box. The establishment rate for the same grass —{' '}
                  {output.alternateRateLbPer1000SqFt} lb per 1,000 sq ft — is sourced, and is the
                  firmer number to reason from: overseeding usually runs at half to two thirds of
                  it.
                </p>
              </div>
            )}

            <div className="border-rule border-t pt-4">
              <p className="text-sm font-semibold">Buying the right weight</p>
              <p className="text-ink/90 mt-2 text-sm">{PLS_NOTE}</p>
              <p className="text-ink/90 mt-2 text-sm">
                UMass advises raising the rate by about {Math.round(POOR_CONDITIONS_UPLIFT * 100)}%
                in poor conditions — a rough seedbed, a late sowing, or ground that will be walked
                on while it establishes. That is{' '}
                {Math.round(output.rateLbPer1000SqFt * (1 + POOR_CONDITIONS_UPLIFT) * 100) / 100} lb
                per 1,000 sq ft here.
              </p>
              <p className="text-ink/90 mt-2 text-sm">
                In metric, 1 lb per 1,000 sq ft is about {G_PER_SQM_PER_LB_PER_1000SQFT} g/m², so
                this rate is about{' '}
                {Math.round(output.rateLbPer1000SqFt * G_PER_SQM_PER_LB_PER_1000SQFT * 10) / 10}{' '}
                g/m².
              </p>
            </div>

            <div className="border-rule border-t pt-4">
              <p className="text-sm font-semibold">Where this rate comes from</p>
              <p className="text-ink/90 mt-2 text-sm">
                Covers <strong>{output.region}</strong>. Rates for one grass differ several-fold
                between states — buffalograss is 1–2 lb per 1,000 sq ft in Kansas and 3–5 in
                Colorado — so check your own extension service before buying for a large lawn.
              </p>
              <p className="text-ink/70 mt-2 text-xs">{output.source}</p>
            </div>
          </div>
        ) : null
      }
    >
      <NumberField
        label="Lawn area"
        value={values.area ?? ''}
        onChange={(value) => setValue('area', value)}
        suffix={imperial ? 'sq ft' : 'm²'}
        error={errors.area}
      />

      <SelectField
        label="Grass type"
        value={values.grass ?? ''}
        onChange={(value) => setValue('grass', value)}
        options={grassSeedRates.map((rate) => ({
          value: rate.slug,
          label: `${rate.name} — ${rate.season} season`,
        }))}
        error={errors.grass}
      />

      <div className="col-span-2">
        <RadioGroup
          legend="What are you doing?"
          value={purpose}
          onChange={(value) => setValue('purpose', value)}
          options={[
            { value: 'new-lawn', label: 'Seeding bare soil' },
            { value: 'overseed', label: 'Overseeding existing grass' },
          ]}
        />
      </div>
    </CalculatorFrame>
  );
}
