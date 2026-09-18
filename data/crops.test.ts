import { describe, expect, it } from 'vitest';
import { crops } from './crops';

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

  it('writes every reason as "short phrase — full explanation"', () => {
    // A table cell shows the clause before the dash, so a reason without one
    // would spill a whole sentence into a narrow column.
    const reasons = crops.flatMap((crop) =>
      [
        [crop.slug, crop.noSowIndoorsReason],
        [crop.slug, crop.noTransplantReason],
        [crop.slug, crop.noDirectSowReason],
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
});
