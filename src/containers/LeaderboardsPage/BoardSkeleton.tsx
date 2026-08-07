import { Skeleton, SkeletonText } from '@/components/brand';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { HEIGHT } from './Podium';
import { COLS } from './RankTable';

/**
 * Stand-in for the Podium + RankTable pair. It reuses their own layout
 * constants (`HEIGHT`, `COLS`) and card chrome, so the ranking drops straight
 * into the space the skeleton was already holding.
 */
export function BoardSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div aria-busy="true">
      {/* PODIUM — places read 2-1-3 left to right, as designed. */}
      <Card
        className="mb-6 overflow-hidden px-6 pb-0 pt-8"
        style={{ background: 'linear-gradient(180deg, rgba(139,92,246,.08), transparent)' }}
      >
        <div className="flex flex-wrap items-end justify-center gap-6">
          {[2, 1, 3].map((place) => (
            <div key={place} className="flex w-[200px] max-w-full flex-col items-center">
              <Skeleton
                className={cn('rounded-full', place === 1 ? 'h-[76px] w-[76px]' : 'h-16 w-16')}
              />
              <SkeletonText text="text-[17px]" bar="h-4 w-28" className="mt-3.5" />
              <SkeletonText text="text-[12.5px]" bar="h-3 w-20" className="mb-2" />
              <Skeleton className="h-[22px] w-[76px] rounded-pill" />
              <div
                className={cn(
                  'mt-4 flex w-full flex-col items-center rounded-t-[14px] border border-b-0 border-line-2 pt-[18px]',
                  HEIGHT[place]
                )}
              >
                <Skeleton className="h-[44px] w-8 rounded-md" />
                <SkeletonText text="text-[13px]" bar="h-3 w-14" className="mt-2" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* RANK TABLE — the header row is real; only the body is pending. */}
      <Card className="overflow-hidden p-0">
        <div
          className={cn(
            'grid gap-2 border-b border-line px-6 py-4 text-[11.5px] font-bold uppercase tracking-[.05em] text-ink-3',
            COLS
          )}
        >
          <span>Rank</span>
          <span>Investor</span>
          <span>League</span>
          <span className="text-center">Trend</span>
          <span className="text-right">Portfolio</span>
          <span className="text-right">Return</span>
        </div>

        {Array.from({ length: rows }, (_, i) => (
          <div
            key={i}
            className={cn('grid items-center gap-2 border-b border-line px-6 py-3.5', COLS)}
          >
            <SkeletonText text="text-[18px]" bar="h-[18px] w-6" />
            <div className="flex min-w-0 items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="min-w-0 flex-1">
                <SkeletonText text="text-[14.5px]" bar="h-3.5 w-32" />
                <SkeletonText text="text-[12.5px]" bar="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-[22px] w-[84px] rounded-pill" />
            <div className="flex justify-center">
              <Skeleton className="h-6 w-16" />
            </div>
            <SkeletonText text="text-[14px]" bar="h-3.5 w-20" className="text-right" />
            <SkeletonText text="text-[14px]" bar="h-3.5 w-16" className="text-right" />
          </div>
        ))}

        <div className="flex justify-center p-4">
          <Skeleton className="h-3.5 w-64 max-w-full" />
        </div>
      </Card>
    </div>
  );
}

export default BoardSkeleton;
