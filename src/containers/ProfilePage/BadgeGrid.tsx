import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { RARITY } from './useProfile';
import type { BadgeTile } from './types';

// The badge documents point at artwork (first.png, second.png, …) that does not
// exist in the client bundle, so tiles are built from the badge's real `rarity`
// field instead: a tinted disc carrying the rarity initial.
const RARITY_STYLE = [
  { fg: '#5F5577', bg: 'rgba(30,16,48,.06)' }, // Common
  { fg: '#0A9A52', bg: 'rgba(10,154,82,.12)' }, // Uncommon
  { fg: '#2563EB', bg: 'rgba(37,99,235,.12)' }, // Rare
  { fg: '#7C3AED', bg: 'rgba(124,58,237,.12)' }, // Epic
  { fg: '#B57E0B', bg: 'rgba(181,126,11,.14)' }, // Legendary
  { fg: '#D62D8E', bg: 'rgba(214,45,142,.12)' }, // Mythic
  { fg: '#C77A3C', bg: 'rgba(199,122,60,.14)' }, // Exotic
];

const styleFor = (rarity: number) => RARITY_STYLE[rarity] ?? RARITY_STYLE[0];
const rarityName = (rarity: number) => RARITY[rarity] ?? 'Common';

export function BadgeGrid({
  tiles,
  earnedCount,
  limit,
  onShowAll,
}: {
  tiles: BadgeTile[];
  earnedCount: number;
  visible?: number;
  limit: number;
  onShowAll: () => void;
}) {
  const shown = tiles.slice(0, limit);
  const hidden = tiles.length - shown.length;

  return (
    <Card className="p-6">
      <div className="mb-[18px] flex items-center justify-between gap-4">
        <h2 className="m-0 font-display text-[19px] font-bold text-ink">
          Badges{' '}
          <span className="text-[15px] font-medium text-ink-3">
            · {earnedCount} of {tiles.length}
          </span>
        </h2>
        {hidden > 0 && (
          <button
            type="button"
            onClick={onShowAll}
            className="cursor-pointer border-0 bg-transparent p-0 text-[13.5px] font-semibold text-violet hover:brightness-110"
          >
            View all →
          </button>
        )}
      </div>

      {!tiles.length ? (
        <p className="py-6 text-center text-[13.5px] text-ink-3">No badges are available yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((b) => {
            const s = styleFor(b.rarity);
            return (
              <div
                key={b.id}
                title={
                  b.earned
                    ? `${b.description}${b.acquisition ? ` — ${b.acquisition}` : ''}`
                    : b.description
                }
                className={cn(
                  'rounded-[14px] px-2 py-[18px] text-center',
                  b.earned
                    ? 'border border-line-2 bg-surface-2'
                    : 'border border-dashed border-line-2 bg-transparent opacity-45'
                )}
              >
                <div
                  className="mx-auto mb-2 flex h-[42px] w-[42px] items-center justify-center rounded-full font-display text-[16px] font-extrabold"
                  style={
                    b.earned
                      ? { color: s.fg, background: s.bg }
                      : { color: '#938AA8', background: 'rgba(30,16,48,.05)' }
                  }
                >
                  {rarityName(b.rarity).charAt(0)}
                </div>
                <div
                  className={cn(
                    'line-clamp-2 text-[12.5px] font-semibold leading-tight',
                    b.earned ? 'text-ink' : 'text-ink-3'
                  )}
                >
                  {b.name}
                </div>
                <div className="mt-1 text-[10.5px] text-ink-3">
                  {b.earned ? rarityName(b.rarity) : 'Locked'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export default BadgeGrid;
