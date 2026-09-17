import { formatDate } from '@/lib/legal';

export function LastUpdated({ date }: { date: string | undefined }) {
  const formatted = date ? formatDate(date) : '';
  if (!formatted) return null;

  return (
    <p className="text-ink/70 mt-2 text-sm">
      Last updated <time dateTime={date}>{formatted}</time>
    </p>
  );
}
