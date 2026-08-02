// Shared SVG path builder for the brand charts. Maps a numeric series onto an
// SVG polyline within a w×h box. Ported from fb-shared.jsx pathFrom.
export function pathFrom(data: number[], w: number, h: number, pad = 2): string {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const r = max - min || 1;
  const dx = (w - pad * 2) / (data.length - 1);
  return data
    .map(
      (d, i) =>
        `${i ? 'L' : 'M'}${(pad + i * dx).toFixed(2)} ${(
          h -
          pad -
          ((d - min) / r) * (h - pad * 2)
        ).toFixed(2)}`
    )
    .join(' ');
}

export const CHART_UP = '#0A9A52';
export const CHART_DOWN = '#DA2F4D';
