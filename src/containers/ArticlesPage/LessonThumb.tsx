import type { LessonCategory } from './types';

// Lessons carry no artwork, and the design's own thumbnails are duotone
// gradient placeholders with a glyph. Each category gets a fixed pair so the
// hub stays visually consistent and a lesson always looks the same.
const CATEGORY_ART: Record<LessonCategory, { a: string; b: string; icon: string }> = {
  Basics: { a: '#8B5CF6', b: '#4C1D95', icon: '📊' },
  Markets: { a: '#FF7AB8', b: '#9D1267', icon: '🐂' },
  Strategy: { a: '#2BE08C', b: '#0E6B45', icon: '⚖️' },
  Risk: { a: '#FFC65C', b: '#B45309', icon: '🛟' },
  Crypto: { a: '#62B6FF', b: '#1E40AF', icon: '🪙' },
  Retirement: { a: '#7AE0D0', b: '#0E6B6B', icon: '🌴' },
};

export const artFor = (category: LessonCategory) => CATEGORY_ART[category] ?? CATEGORY_ART.Basics;

export function LessonThumb({
  category,
  height = 150,
  label,
}: {
  category: LessonCategory;
  height?: number;
  label?: string;
}) {
  const art = artFor(category);

  return (
    <div
      className="relative flex items-center justify-center overflow-hidden"
      style={{ height, background: `linear-gradient(135deg, ${art.a}, ${art.b})` }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 opacity-[.14]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 80% 20%, #fff 0, transparent 40%), radial-gradient(circle at 20% 90%, #000 0, transparent 45%)',
        }}
      />
      <span
        style={{
          fontSize: height > 220 ? 64 : 40,
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.3))',
        }}
      >
        {art.icon}
      </span>
      {label && (
        <span className="absolute left-3.5 top-3.5 text-[11.5px] font-bold uppercase tracking-[.08em] text-white/85">
          {label}
        </span>
      )}
    </div>
  );
}

export default LessonThumb;
