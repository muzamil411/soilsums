import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';
import { Callout } from '@/components/ui/Callout';
import { BagVolumeTable } from '@/components/tools/tables/BagVolumeTable';
import { BedPlanTable } from '@/components/tools/tables/BedPlanTable';
import { CompostMaterialTable } from '@/components/tools/tables/CompostMaterialTable';
import { CropSpacingTable, SpacingGridTable } from '@/components/tools/tables/CropSpacingTable';
import { CropWaterTable } from '@/components/tools/tables/CropWaterTable';
import { CropYieldTable } from '@/components/tools/tables/CropYieldTable';
import { GrassSeedRateTable } from '@/components/tools/tables/GrassSeedRateTable';
import { LimeComparisonTable } from '@/components/tools/tables/LimeComparisonTable';
import { LimeRateTable } from '@/components/tools/tables/LimeRateTable';
import { PlantingOffsetTable } from '@/components/tools/tables/PlantingOffsetTable';
import {
  DirectSowOnlyTable,
  IndoorSowingTable,
} from '@/components/tools/tables/SeedStartingTables';
import { SfgDensityTable, SfgFallbackTable } from '@/components/tools/tables/SfgDensityTable';
import { isDraftContentHref } from '@/lib/content/draft-links';

/**
 * The App Router MDX convention: every .mdx file renders through these
 * components. Long-form styling lives in the .prose-notebook class in
 * app/globals.css, so this file only handles behaviour — internal links go
 * through next/link, links to unpublished articles degrade to plain text,
 * tables get a scroll container on narrow screens — and exposes the components
 * an article is allowed to use.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ href, children, ...props }) => {
      const target = typeof href === 'string' ? href : '';

      // A link to an article or crop guide that has not been published yet
      // would 404, since the static export only builds published routes. The
      // sentence still reads correctly without the anchor, and the link
      // appears by itself once the target goes live.
      if (isDraftContentHref(target)) {
        return <span {...props}>{children}</span>;
      }

      if (target.startsWith('/')) {
        return (
          <Link href={target} {...props}>
            {children}
          </Link>
        );
      }
      return (
        <a href={target} rel="nofollow noopener noreferrer" target="_blank" {...props}>
          {children}
        </a>
      );
    },
    table: ({ children, ...props }) => (
      <div className="my-5 overflow-x-auto">
        <table {...props}>{children}</table>
      </div>
    ),
    Callout,
    // Tables generated from the data files. An agronomic figure that a data
    // file covers is never written into Markdown by hand: that is how four
    // tool pages ended up contradicting their own calculators, and
    // lib/content/mdx-figures.test.ts now fails the build if it happens again.
    BagVolumeTable,
    BedPlanTable,
    CompostMaterialTable,
    CropSpacingTable,
    CropWaterTable,
    DirectSowOnlyTable,
    CropYieldTable,
    GrassSeedRateTable,
    IndoorSowingTable,
    LimeComparisonTable,
    LimeRateTable,
    PlantingOffsetTable,
    SfgDensityTable,
    SfgFallbackTable,
    SpacingGridTable,
    ...components,
  };
}
