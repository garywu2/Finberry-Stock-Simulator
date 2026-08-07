import { Avatar, Pill, Skeleton } from '@/components/brand';
import { Card } from '@/components/ui/card';
import type { ProfileUser } from './types';

/** Handle derived from the username — the user model has no handle field. */
function handleFor(user: ProfileUser | null) {
  const base = user?.username?.trim() || (user?.email ?? '').split('@')[0];
  return base ? '@' + base.toLowerCase().replace(/\s+/g, '.') : '';
}

export function ProfileHero({
  user,
  displayName,
  league,
  earnedCount,
  totalBadges,
  badgesLoading,
}: {
  user: ProfileUser | null;
  displayName: string;
  league: string | null;
  earnedCount: number;
  totalBadges: number;
  /** Badge counts arrive after the hero paints — 0 / 0 would be a wrong claim. */
  badgesLoading: boolean;
}) {
  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : null;

  // The design's level/XP bar has no backing model; badge completion is the
  // real progression signal we do have, and reads the same way.
  const pct = totalBadges > 0 ? (earnedCount / totalBadges) * 100 : 0;

  return (
    <Card
      className="relative mb-6 overflow-hidden p-6 md:p-8"
      style={{
        background:
          'radial-gradient(120% 160% at 0% 0%, rgba(139,92,246,.22), transparent 55%), #FFFFFF',
      }}
    >
      <div className="flex flex-wrap items-center gap-6 md:flex-nowrap md:gap-[26px]">
        <Avatar name={displayName} size={104} ring="#7C3AED" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="m-0 font-display text-[32px] font-bold tracking-[-.025em] text-ink">
              {displayName}
            </h1>
            {user?.isPremium && <Pill tone="gold">★ Plus</Pill>}
          </div>

          <div className="mt-1 font-mono text-[14px] text-ink-3">
            {[handleFor(user), joined && `joined ${joined}`, league && `${league} League`]
              .filter(Boolean)
              .join(' · ')}
          </div>

          {user?.bio?.trim() && (
            <p className="mt-2 max-w-[560px] text-[13.5px] leading-[1.5] text-ink-2">
              {user.bio.trim()}
            </p>
          )}

          <div className="mt-[18px] max-w-[460px]" aria-busy={badgesLoading}>
            <div className="mb-[7px] flex justify-between text-[12.5px]">
              <span className="font-bold text-violet">
                {badgesLoading || !(earnedCount === totalBadges && totalBadges > 0)
                  ? 'Badge progress'
                  : 'All badges earned'}
              </span>
              {badgesLoading ? (
                <Skeleton className="h-3 w-24" />
              ) : (
                <span className="font-mono text-ink-3">
                  {earnedCount} / {totalBadges} badges
                </span>
              )}
            </div>
            {badgesLoading ? (
              <Skeleton className="h-[9px] rounded-md" />
            ) : (
              <div
                className="h-[9px] overflow-hidden rounded-md bg-surface-3"
                role="progressbar"
                aria-valuenow={Math.round(pct)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Badge progress"
              >
                <div
                  className="h-full rounded-md"
                  style={{
                    width: `${pct}%`,
                    background: 'linear-gradient(90deg,#7C3AED,#0A9A52)',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default ProfileHero;
