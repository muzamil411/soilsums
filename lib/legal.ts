/** Date shown on the legal pages. Bump when the wording changes. */
export const legalUpdated = '2026-09-17';

/**
 * Formats a YYYY-MM-DD date for reading. Returns an empty string for anything
 * it cannot parse, so a bad value in frontmatter shows nothing rather than the
 * words "Invalid Date" on a published page.
 */
export function formatDate(iso: string): string {
  const timestamp = Date.parse(`${iso}T00:00:00Z`);
  if (Number.isNaN(timestamp)) return '';
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
