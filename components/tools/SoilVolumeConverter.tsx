'use client';

import { useMemo } from 'react';
import { CalculatorFrame } from './CalculatorFrame';
import { errorMap } from './errors';
import { NumberField } from '@/components/ui/NumberField';
import { ResultTable } from '@/components/ui/ResultTable';
import { SelectField } from '@/components/ui/SelectField';
import { Estimate } from '@/components/ui/Estimate';
import { num, useToolState } from '@/lib/hooks/useToolState';
import {
  SOIL_DENSITY,
  UNIT_LABELS,
  VOLUME_UNITS,
  convertSoilVolume,
  type VolumeUnit,
} from '@/lib/calculators/soil-volume';

const PARAMS = { amount: 'a', from: 'u' } as const;

/**
 * The amount is a plain quantity whose meaning comes from the unit beside it,
 * so switching the site's imperial/metric toggle must not rewrite it. Both
 * fields are `none` for that reason, and the defaults are the same either way.
 */
const KINDS = { amount: 'none' as const };

const DEFAULTS = { amount: '25', from: 'dryQuarts' };

const UNIT_OPTIONS = VOLUME_UNITS.map((unit) => ({
  value: unit,
  label: UNIT_LABELS[unit].long,
}));

export function SoilVolumeConverter({ toolSlug }: { toolSlug: string }) {
  const { values, units, setValue, setUnits, reset, shareUrl } = useToolState({
    imperialDefaults: DEFAULTS,
    metricDefaults: DEFAULTS,
    params: PARAMS,
    kinds: KINDS,
  });

  const from: VolumeUnit = (VOLUME_UNITS as readonly string[]).includes(values.from ?? '')
    ? (values.from as VolumeUnit)
    : 'dryQuarts';

  const result = useMemo(
    () => convertSoilVolume({ amount: num(values, 'amount'), from }),
    [values, from],
  );

  const errors = errorMap(result, values);
  const output = result.ok ? result.value : null;
  const imperial = units === 'imperial';

  // The headline is whichever unit answers the question being asked. Someone
  // entering dry quarts wants cubic feet; someone entering cubic feet or yards
  // wants the bag unit back.
  const headlineUnit: VolumeUnit =
    from === 'cubicFeet' || from === 'cubicYards'
      ? 'dryQuarts'
      : imperial
        ? 'cubicFeet'
        : 'liters';

  const weight = output
    ? imperial
      ? `${output.weightLb[0]} to ${output.weightLb[1]} lb`
      : `${output.weightKg[0]} to ${output.weightKg[1]} kg`
    : '';

  return (
    <CalculatorFrame
      toolSlug={toolSlug}
      units={units}
      onUnitsChange={setUnits}
      shareUrl={shareUrl}
      onReset={reset}
      headline={output ? String(output.converted[headlineUnit]) : null}
      headlineUnit={UNIT_LABELS[headlineUnit].long.toLowerCase()}
      sentence={
        output ? (
          <p>
            <strong>
              {output.amount} {UNIT_LABELS[from].long.toLowerCase()}
            </strong>{' '}
            is{' '}
            <strong>
              {output.converted[headlineUnit]} {UNIT_LABELS[headlineUnit].long.toLowerCase()}
            </strong>
            {from === 'dryQuarts' ? (
              <>
                {' '}
                — bagged potting mix is sold in dry quarts, and one cubic foot holds 25.71 of
                them.
              </>
            ) : (
              '.'
            )}{' '}
            It would weigh roughly <strong>{weight}</strong>, depending on the mix and how wet it
            is.
          </p>
        ) : null
      }
      copyText={
        output
          ? `${output.amount} ${UNIT_LABELS[from].long} = ${output.converted.cubicFeet} cubic feet, ${output.converted.liters} liters, ${output.converted.dryQuarts} US dry quarts. Converted at soilsums.com`
          : ''
      }
      extra={
        output ? (
          <>
            <ResultTable
              caption="The same quantity in every unit"
              columns={['Unit', 'Amount', 'What it is used for']}
              rows={VOLUME_UNITS.map((unit) => ({
                key: unit,
                cells: [
                  UNIT_LABELS[unit].long,
                  output.converted[unit],
                  UNIT_LABELS[unit].note,
                ],
              }))}
            />
            <p className="text-ink/80 mt-4 text-sm">
              Weight: about {weight}
              <Estimate what="the bulk density of bagged growing medium" />, using{' '}
              {SOIL_DENSITY.lowLbPerCuFt} to {SOIL_DENSITY.highLbPerCuFt} lb per cubic foot. The
              low end is a dry peat-and-bark mix; the high end is the same mix wet, or one cut
              with compost. Topsoil is far heavier again. A single figure would be wrong for
              almost everyone, which is why this is a range.
            </p>
          </>
        ) : null
      }
    >
      <NumberField
        label="Amount"
        value={values.amount ?? ''}
        onChange={(value) => setValue('amount', value)}
        error={errors.amount}
        suffix={UNIT_LABELS[from].short}
      />

      <SelectField
        label="Measured in"
        value={from}
        onChange={(value) => setValue('from', value)}
        options={UNIT_OPTIONS}
        hint={UNIT_LABELS[from].note}
      />
    </CalculatorFrame>
  );
}
