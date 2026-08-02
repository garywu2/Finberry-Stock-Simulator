import { pathFrom, CHART_UP, CHART_DOWN } from './chart-utils';

// Compact inline trend line for tables/watchlists. Takes a real numeric series.
// Ported from fb-shared.jsx Sparkline. (See AreaChart for the dither-kit note.)
export function Sparkline({
  data,
  up,
  w = 88,
  h = 30,
  className,
}: {
  data: number[];
  up?: boolean;
  w?: number;
  h?: number;
  className?: string;
}) {
  if (!data || data.length < 2) return null;
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
