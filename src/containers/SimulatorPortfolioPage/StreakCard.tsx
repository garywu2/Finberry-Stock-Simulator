import { Card } from '@/components/ui/card';

// TODO(phase-3/4): streaks, XP and daily challenges have no backend model yet
// (see docs/redesign/implementation-roadmap.md "New feature data models").
// This card is intentionally static placeholder content and is labelled as
// such in the UI so it cannot be mistaken for real progress.
const STREAK_DAYS = 12;
const CHALLENGE_PROGRESS = 66;

export function StreakCard() {
  return (
    <Card
      className="border-line-2 p-[22px]"
      style={{
        background: 'linear-gradient(150deg, rgba(139,92,246,.16), rgba(43,224,140,.06))',
      }}
    >
      <div className="mb-3 flex items-center gap-2.5">
        <span className="text-[22px]" aria-hidden="true">
          🔥
        </span>
        <div>
          <div className="text-[15px] font-bold text-ink">{STREAK_DAYS}-day streak</div>
          <div className="text-[12.5px] text-ink-2">Keep learning to grow your berry</div>
        </div>
      </div>

      <div className="mb-1.5 text-[13.5px] font-semibold text-ink">Today’s challenge</div>
      <p className="mb-3.5 text-[13.5px] leading-[1.45] text-ink-2">
        Diversify into a new sector to earn the <b className="text-gold">Sector Explorer</b> badge.
      </p>

      <div
        className="h-[7px] overflow-hidden rounded-md bg-surface-3"
        role="progressbar"
        aria-valuenow={CHALLENGE_PROGRESS}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Today’s challenge progress"
      >
        <div
          className="h-full rounded-md"
          style={{
            width: `${CHALLENGE_PROGRESS}%`,
            background: 'linear-gradient(90deg,#7C3AED,#0A9A52)',
          }}
        />
      </div>
      <div className="mt-2 font-mono text-[12px] text-ink-3">
        +180 XP · 2 of 3 sectors · <span className="text-ink-3">sample data</span>
      </div>
    </Card>
  );
}

export default StreakCard;
