import { formatDate } from '@/lib/legal';

export function LastUpdated({ date }: { date: string }) {
  return (
    <p className="text-ink/70 mt-2 text-sm">
      Last updated <time dateTime={date}>{formatDate(date)}</time>
    </p>
  );
}
