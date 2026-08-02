import { useId } from 'react';
import { pathFrom, CHART_UP, CHART_DOWN } from './chart-utils';

// Gradient-filled area chart. Fills its container (give it a sized parent).
// Takes a real numeric series — feed it historical prices in Phase 2.
// Ported from fb-shared.jsx AreaChart.
//
// NOTE: the design handoff mandates replacing this with dither-kit's dithered
// <AreaChart>. dither-kit's CLI currently fails against shadcn's registry
// (colors/violet.json 404); this SVG port keeps the same data-in interface so
// the swap is a drop-in later. See docs/redesign/implementation-roadmap.md.
export function AreaChart({
  data,
  up = true,
  grid = true,
  w = 760,
  h = 240,
  className,
}: {
  data: number[];
  up?: boolean;
  grid?: boolean;
  w?: number;
  h?: number;
  className?: string;
}) {
  const gid = useId();
  if (!data || data.length < 2) return null;

  const color = up ? CHART_UP : CHART_DOWN;
  const line = pathFrom(data, w, h, 6);
  const area = `${line} L${w - 6} ${h - 6} L6 ${h - 6} Z`;
  const rows = [0.18, 0.42, 0.66, 0.9];

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={className}
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.28" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {grid &&
        rows.map((r, i) => (
          <line
            key={i}
            x1="0"
            y1={h * r}
            x2={w}
            y2={h * r}
            stroke="rgba(30,16,48,.07)"
            strokeWidth="1"
            strokeDasharray="2 5"
          />
        ))}
      <path d={area} fill={`url(#${gid})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default AreaChart;
