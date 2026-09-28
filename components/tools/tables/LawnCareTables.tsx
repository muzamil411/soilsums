import {
  ANNUAL_NITROGEN,
  FEED_WINDOWS,
  FOLK_FIGURE_INCHES_PER_WEEK,
  IOWA_STATE_LAWN,
  MISSOURI_FERTILIZER,
  MISSOURI_WATER,
  WATER_NEEDS,
  amountLabel,
} from '@/data/lawn-care';
import { DataTable } from './DataTable';

/**
 * Annual nitrogen by grass, and the month-by-month split.
 *
 * Generated rather than written out, because mdx-figures.test.ts forbids a
 * Markdown table restating figures a data file owns — prose may cite them, a
 * table row may not, since a table row is a data record.
 */
export function AnnualNitrogenTable() {
  return (
    <>
      <DataTable
        columns={['Grass', 'Nitrogen per year, lb per 1,000 sq ft']}
        align={['left', 'right']}
      >
        {ANNUAL_NITROGEN.map((row) => (
          <tr key={row.grass}>
            <td>{row.grass}</td>
            <td style={{ textAlign: 'right' }}>{amountLabel(row.lbPer1000SqFtPerYear, 'lb')}</td>
          </tr>
        ))}
      </DataTable>
      <p>
        From{' '}
        <a href={MISSOURI_FERTILIZER.url} rel="nofollow">
          {MISSOURI_FERTILIZER.institution}
        </a>
        , {MISSOURI_FERTILIZER.title}. Cool-season grasses only.
      </p>
    </>
  );
}

/** The dated applications, with September marked as the one that matters most. */
export function FeedCalendarTable() {
  return (
    <>
      <DataTable columns={['When', 'Nitrogen, lb per 1,000 sq ft', 'What it is for']}>
        {FEED_WINDOWS.map((row) => (
          <tr key={row.window}>
            <td>
              {row.emphasis === 'most-important' ? <strong>{row.window}</strong> : row.window}
            </td>
            <td>{amountLabel(row.nitrogenLbPer1000SqFt, 'lb')}</td>
            <td className="text-sm">{row.purpose}</td>
          </tr>
        ))}
      </DataTable>
      <p>
        Dated applications and rates from{' '}
        <a href={MISSOURI_FERTILIZER.url} rel="nofollow">
          {MISSOURI_FERTILIZER.institution}
        </a>
        , {MISSOURI_FERTILIZER.title}. Where the rate reads &ldquo;a moderate rate&rdquo;, that is
        what the publication says — it gives no figure for those two, so neither do we. How many of
        these a lawn needs is from{' '}
        <a href={IOWA_STATE_LAWN.url} rel="nofollow">
          {IOWA_STATE_LAWN.institution}
        </a>
        , {IOWA_STATE_LAWN.title}.
      </p>
    </>
  );
}

/**
 * Weekly water use by grass, with the folk figure alongside for comparison.
 *
 * The comparison column is the point of the table: it shows that one inch a week
 * is not a safe average but wrong in both directions, too much for tall fescue
 * and too little for perennial ryegrass.
 */
export function LawnWaterTable() {
  return (
    <>
      <DataTable
        columns={[
          'Grass',
          'Green and growing',
          'Dormant, just surviving',
          'Against "one inch a week"',
        ]}
        align={['left', 'right', 'right', 'left']}
      >
        {WATER_NEEDS.map((row) => {
          const diff = row.greenInchesPerWeek - FOLK_FIGURE_INCHES_PER_WEEK;
          const verdict =
            diff === 0
              ? 'The same'
              : diff > 0
                ? `${Math.round(diff * 100) / 100} in a week short`
                : `${Math.round(-diff * 100) / 100} in a week too much`;
          return (
            <tr key={row.grass}>
              <td>
                {row.grass}
                {row.season === 'warm' ? (
                  <span className="text-ink/70 text-sm"> (warm)</span>
                ) : null}
              </td>
              <td style={{ textAlign: 'right' }}>{row.greenInchesPerWeek} in</td>
              <td style={{ textAlign: 'right' }}>{row.dormantInchesPerWeek} in</td>
              <td className="text-sm">{verdict}</td>
            </tr>
          );
        })}
      </DataTable>
      <p>
        Inches of water a week, from{' '}
        <a href={MISSOURI_WATER.url} rel="nofollow">
          {MISSOURI_WATER.institution}
        </a>
        , {MISSOURI_WATER.title}. The last column compares each figure with the one inch a week
        almost every lawn page repeats. Dormant figures keep a brown lawn alive rather than green,
        which is a different goal rather than a reduced version of the same one.
      </p>
    </>
  );
}
