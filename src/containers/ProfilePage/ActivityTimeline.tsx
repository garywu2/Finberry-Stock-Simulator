import { Skeleton, SkeletonText } from '@/components/brand';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ActivityItem } from './types';

const MARK: Record<ActivityItem['kind'], { glyph: string; className: string }> = {
  buy: { glyph: '▲', className: 'text-up' },
  sell: { glyph: '▼', className: 'text-down' },
  badge: { glyph: '★', className: 'text-gold' },
};

/** "2h ago" / "Yesterday" / "4d ago", falling back to a date. */
export function relativeTime(iso: string, now = Date.now()) {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return '';
  const mins = Math.round((now - then) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function ActivityTimeline({
  items,
  visible,
  loading,
  onShowMore,
}: {
  items: ActivityItem[];
  visible: number;
  /** The feed merges trades and badge awards; both are still in flight. */
  loading: boolean;
  onShowMore: () => void;
}) {
  const shown = items.slice(0, visible);
  const more = items.length - shown.length;

  return (
    <Card className="p-6" aria-busy={loading}>
      <h2 className="mb-[18px] mt-0 font-display text-[18px] font-bold text-ink">
        Recent activity
      </h2>

      {loading ? (
        <div className="relative">
          {Array.from({ length: visible }, (_, i) => {
            const last = i === visible - 1;
            return (
              <div key={i} className={cn('relative flex gap-3.5', !last && 'pb-[22px]')}>
                <div className="flex flex-col items-center">
                  <Skeleton className="z-[1] h-9 w-9 shrink-0 rounded-full" />
                  {!last && <div className="mt-1 w-px flex-1 bg-line-2" />}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <SkeletonText text="text-[14px]" bar="h-3.5 w-40 max-w-full" />
                  <SkeletonText text="text-[12.5px]" bar="h-3 w-28" className="mt-0.5" />
                  <SkeletonText text="text-[11.5px]" bar="h-2.5 w-20" className="mt-1" />
                </div>
              </div>
            );
          })}
        </div>
      ) : !shown.length ? (
        <p className="py-6 text-center text-[13.5px] text-ink-3">
          Nothing here yet — your trades and badges will appear as you go.
        </p>
      ) : (
        <div className="relative">
          {shown.map((a, i) => {
            const mark = MARK[a.kind];
            const last = i === shown.length - 1;
            return (
              <div key={a.id} className={cn('relative flex gap-3.5', !last && 'pb-[22px]')}>
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line-2 bg-surface-2 text-[13px]',
                      mark.className
                    )}
                    aria-hidden="true"
                  >
                    {mark.glyph}
                  </div>
                  {!last && <div className="mt-1 w-px flex-1 bg-line-2" />}
                </div>
                <div className="min-w-0 pt-0.5">
                  <div className="text-[14px] font-semibold leading-[1.35] text-ink">{a.title}</div>
                  {a.detail && <div className="mt-0.5 text-[12.5px] text-ink-3">{a.detail}</div>}
                  <div className="mt-1 font-mono text-[11.5px] text-ink-3 opacity-80">
                    {relativeTime(a.at)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && more > 0 && (
        <Button
          variant="ghost"
          size="block"
          onClick={onShowMore}
          className="mt-[22px] text-[13.5px]"
        >
          See full history ({more} more)
        </Button>
      )}
    </Card>
  );
}

export default ActivityTimeline;
