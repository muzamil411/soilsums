import { describe, expect, it } from 'vitest';
import { CHECKED_FIELDS, crops, plantsPerSquareFoot } from './crops';

describe('crop data', () => {
  it('explains every planting step it leaves out', () => {
    for (const crop of crops) {
      if (crop.sowIndoorsWeeksBeforeLastFrost === null) {
        expect(crop.noSowIndoorsReason, `${crop.slug} sow indoors`).toBeTruthy();
      }
      if (crop.transplantWeeksAfterLastFrost === null) {
        expect(crop.noTransplantReason, `${crop.slug} transplant`).toBeTruthy();
      }
      if (crop.directSowWeeksRelativeToLastFrost === null) {
        expect(crop.noDirectSowReason, `${crop.slug} direct sow`).toBeTruthy();
      }
    }
  });

  it("explains every missing days-to-maturity in the crop's own words", () => {
    // The quick-facts table used to derive one sentence for every null here,
    // and it said "a perennial". Marigold is an annual with no published
    // figure, so the page answering "are marigolds perennial" carried the
    // opposite claim in the box Google is most likely to lift. Any crop that
    // omits the figure now has to say why itself.
    for (const crop of crops) {
      if (crop.daysToMaturity === null) {
        expect(crop.noDaysToMaturityReason, `${crop.slug} days to maturity`).toBeTruthy();
      } else {
        expect(crop.noDaysToMaturityReason, crop.slug).toBeUndefined();
      }
    }
  });

  it('writes every reason as "short phrase — full explanation"', () => {
    // A table cell shows the clause before the dash, so a reason without one
    // would spill a whole sentence into a narrow column.
    const reasons = crops.flatMap((crop) =>
      [
        [crop.slug, crop.noSowIndoorsReason],
        [crop.slug, crop.noTransplantReason],
        [crop.slug, crop.noDirectSowReason],
        [crop.slug, crop.noDaysToMaturityReason],
      ].filter(([, reason]) => reason !== undefined),
    );
    expect(reasons.length).toBeGreaterThan(0);
    for (const [slug, reason] of reasons) {
      expect(String(reason), `${slug}: ${reason}`).toContain(' — ');
      const short = String(reason).split(' — ')[0] ?? '';
      expect(short.length, `${slug} short form too long: ${short}`).toBeLessThanOrEqual(40);
    }
  });

  it('gives no reason where a step does apply', () => {
    for (const crop of crops) {
      if (crop.sowIndoorsWeeksBeforeLastFrost !== null) {
        expect(crop.noSowIndoorsReason, crop.slug).toBeUndefined();
      }
      if (crop.directSowWeeksRelativeToLastFrost !== null) {
        expect(crop.noDirectSowReason, crop.slug).toBeUndefined();
      }
    }
  });

  it('keeps every indoor period between 2 and 12 weeks', () => {
    // sowIndoors + transplant is the time a seedling actually spends under
    // lights. The September 2026 report found 13 crops where the two fields had
    // drifted apart until that total contradicted Rutgers FS787's
    // seed-to-transplant times — cucumbers at 5 weeks indoors, lettuce at 3.
    // Neither field is wrong on its own, which is why only the pair catches it.
    for (const crop of crops) {
      const sow = crop.sowIndoorsWeeksBeforeLastFrost;
      if (sow === null) continue;
      const transplant = crop.transplantWeeksAfterLastFrost;
      expect(transplant, `${crop.slug} is sown indoors but never transplanted`).not.toBeNull();
      const indoors = sow + (transplant as number);
      expect(indoors, `${crop.slug} spends ${indoors} weeks indoors`).toBeGreaterThanOrEqual(2);
      expect(indoors, `${crop.slug} spends ${indoors} weeks indoors`).toBeLessThanOrEqual(12);
    }
  });

  it('computes plants per square foot from spacing rather than storing it', () => {
    expect(plantsPerSquareFoot({ spacingInches: 12 })).toBe(1);
    expect(plantsPerSquareFoot({ spacingInches: 6 })).toBe(4);
    expect(plantsPerSquareFoot({ spacingInches: 3 })).toBe(16);
    expect(plantsPerSquareFoot({ spacingInches: 24 })).toBe(0.25);
    expect(plantsPerSquareFoot({ spacingInches: 18 })).toBe(0.44);
    for (const crop of crops) {
      expect(plantsPerSquareFoot(crop), crop.slug).toBeGreaterThan(0);
    }
  });

  it('never derives the square foot gardening figure from spacing', () => {
    // The two are different claims. If they were the same number the label
    // would be decoration, so this guards the distinction rather than a value.
    const sfg = crops.filter((crop) => crop.sfgPlantsPerSquare !== null);
    expect(sfg.length).toBeGreaterThan(10);
    const differ = sfg.filter((crop) => crop.sfgPlantsPerSquare !== plantsPerSquareFoot(crop));
    expect(differ.length).toBeGreaterThan(0);
    for (const crop of sfg) {
      expect(crop.sfgPlantsPerSquare, crop.slug).toBeGreaterThan(0);
    }
  });

  it('cites a source for every field it claims to have verified', () => {
    for (const crop of crops) {
      if (crop.verifiedFields.length > 0) {
        expect(crop.source, `${crop.slug} claims verified fields with no source`).not.toBeNull();
      }
      for (const field of crop.verifiedFields) {
        expect(CHECKED_FIELDS, `${crop.slug}: ${field}`).toContain(field);
      }
      expect(new Set(crop.verifiedFields).size, `${crop.slug} repeats a field`).toBe(
        crop.verifiedFields.length,
      );
    }
  });

  it('marks a crop verified only when every applicable field is confirmed', () => {
    // A null planting offset is a reason rather than a figure, so there is
    // nothing to check. A null SFG figure is still a claim — "the Cornell page
    // does not name this crop" — so it stays applicable.
    const optional = new Set([
      'sowIndoorsWeeksBeforeLastFrost',
      'transplantWeeksAfterLastFrost',
      'directSowWeeksRelativeToLastFrost',
    ]);
    for (const crop of crops) {
      const applicable = CHECKED_FIELDS.filter(
        (field) => !optional.has(field) || crop[field] !== null,
      );
      const complete = applicable.every((field) => crop.verifiedFields.includes(field));
      expect(crop.verified, `${crop.slug}`).toBe(complete);
    }
  });

  it('gives a temperature trigger to every warm-season crop the report named', () => {
    // A frost-date offset alone tells a reader to sow melon seed into 50°F
    // soil, where it simply rots. These crops need the second condition.
    const warm = [
      'pea',
      'corn',
      'cucumber',
      'zucchini',
      'squash',
      'watermelon',
      'pepper',
      'eggplant',
      'sweet-potato',
    ];
    for (const slug of warm) {
      const crop = crops.find((entry) => entry.slug === slug);
      expect(crop, slug).toBeTruthy();
      expect(crop?.soilOrAirTempNote, slug).toBeTruthy();
    }
  });
});
