import { pathFrom, CHART_UP, CHART_DOWN } from './chart-utils';
import { Skeleton } from './Skeleton';

// Compact inline trend line for tables/watchlists. Takes a real numeric series.
// Ported from fb-shared.jsx Sparkline. (See AreaChart for the dither-kit note.)
export function Sparkline({
  data,
  up,
  w = 88,
  h = 30,
  loading = false,
  className,
}: {
  data: number[];
  up?: boolean;
  w?: number;
  h?: number;
  /** Series still being backfilled — hold a sized skeleton instead of collapsing. */
  loading?: boolean;
  className?: string;
}) {
  // Fewer than two points is not a drawable line: pathFrom divides by
  // (length - 1), so the guard is load-bearing. Reserve the footprint either
  // way — collapsing to 0×0 and then popping to w×h is a layout jump.
  if (!data || data.length < 2) {
    const box = { width: w, height: h };
    return loading ? (
      <div className={className} style={{ ...box, display: 'flex', alignItems: 'center' }}>
        <Skeleton className="h-2.5 w-full" />
      </div>
    ) : (
      <span aria-hidden="true" className={className} style={{ ...box, display: 'block' }} />
    );
  }
  const color = up ? CHART_UP : CHART_DOWN;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      style={{ display: 'block' }}
    >
      <path
        d={pathFrom(data, w, h, 2)}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default Sparkline;
