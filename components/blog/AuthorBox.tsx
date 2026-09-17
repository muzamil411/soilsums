import Link from 'next/link';
import { site } from '@/lib/seo/site';
import { formatDate } from '@/lib/legal';

/**
 * The author box that closes every article. Says who wrote it, how the site
 * works, and when the piece was last looked at — the three things a reader
 * needs to judge whether to trust it.
 */
export function AuthorBox({ published, updated }: { published?: string; updated?: string }) {
  return (
    <aside className="border-ink/25 bg-paper mt-10 border">
      <div className="bg-kale text-paper flex items-baseline justify-between px-3 py-1.5">
        <span className="font-display text-sm">About the author</span>
        <span aria-hidden="true" className="bg-radish h-2 w-8" />
      </div>
      <div className="p-4">
        <p className="font-display text-lg">{site.author}</p>
        <p className="text-ink/90 mt-1 text-sm">
          {site.author} writes and maintains SoilSums, a set of gardening calculators built on plain
          arithmetic with the formula shown on every page. Agronomic figures here carry a source and
          a record of whether they have been checked, and corrections are the most welcome mail the
          site gets.
        </p>
        <p className="mt-3 text-sm">
          <Link href="/about/" className="font-semibold">
            More about SoilSums
          </Link>
          {' · '}
          <Link href="/contact/" className="font-semibold">
            Send a correction
          </Link>
        </p>
        <dl className="text-ink/70 mt-3 space-y-0.5 text-xs">
          {published && formatDate(published) ? (
            <div className="flex gap-2">
              <dt>Published</dt>
              <dd>
                <time dateTime={published}>{formatDate(published)}</time>
              </dd>
            </div>
          ) : null}
          {updated && formatDate(updated) ? (
            <div className="flex gap-2">
              <dt>Last updated</dt>
              <dd>
                <time dateTime={updated}>{formatDate(updated)}</time>
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
    </aside>
  );
}
