import { useContext, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import UserContext from '@/context/user';
import {
  AreaChart,
  BrandFooter,
  Caret,
  Pill,
  Skeleton,
  SkeletonText,
  TopNav,
} from '@/components/brand';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { displayName as nameOf, signedPct, usd } from '@/lib/format';
import { leagueFor } from '@/containers/LeaderboardsPage/league';
import ActivityTimeline from './ActivityTimeline';
import BadgeGrid from './BadgeGrid';
import ProfileHero from './ProfileHero';
import StatStrip from './StatStrip';
import { useProfile } from './useProfile';

const BADGES_PREVIEW = 8;
const ACTIVITY_PREVIEW = 4;

const ProfilePage = () => {
  const { user: authUser } = useContext(UserContext) ?? { user: null };
  const { email: routeEmail } = useParams<{ email: string }>();

  // The route carries the email, but fall back to the signed-in user so the
  // page still works when linked without one.
  const email = routeEmail ?? authUser?.email ?? null;

  const {
    user,
    loading,
    badgesLoading,
    statsLoading,
    activityLoading,
    error,
    primary,
    tradeStats,
    badgeTiles,
    earnedCount,
    totalBadges,
    activity,
  } = useProfile(email);

  const [badgeLimit, setBadgeLimit] = useState(BADGES_PREVIEW);
  const [activityLimit, setActivityLimit] = useState(ACTIVITY_PREVIEW);

  const displayName = useMemo(() => {
    const full = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
    return user?.preferredName?.trim() || full || nameOf(user, email);
  }, [user, email]);

  const allTimeReturn = useMemo(() => {
    if (!primary || !primary.startFund) return null;
    return ((primary.total - primary.startFund) / primary.startFund) * 100;
  }, [primary]);

  const league = primary ? leagueFor(primary.rank, primary.field) : null;

  const asOf = primary?.asOf
    ? new Date(primary.asOf).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen bg-bg font-sans text-ink">
      {/* No ranked entry means no known portfolio total, so the chip is hidden
          rather than asserting $0.00. */}
      <TopNav
        user={displayName}
        balance={
          loading ? <Skeleton className="h-3.5 w-16" /> : primary ? usd(primary.total) : undefined
        }
      />

      <main className="p-6 md:p-[30px]">
        {error && (
          <p className="mb-4 rounded-field border border-down/30 bg-down-soft px-4 py-3 text-[13.5px] font-medium text-down">
            {error}
          </p>
        )}

        {loading ? (
          <ProfileSkeleton />
        ) : (
          <>
            <ProfileHero
              user={user}
              displayName={displayName}
              league={league}
              earnedCount={earnedCount}
              totalBadges={totalBadges}
              badgesLoading={badgesLoading}
            />

            <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
              {/* LEFT */}
              <div className="flex min-w-0 flex-col gap-6">
                <StatStrip
                  allTimeReturn={allTimeReturn}
                  winRate={tradeStats.winRate}
                  bestTrade={tradeStats.bestTrade?.returnPct ?? null}
                  rank={primary?.rank ?? null}
                  field={primary?.field ?? null}
                  approximate={tradeStats.skippedSells > 0}
                  loading={statsLoading}
                />

                {/* PORTFOLIO */}
                <Card className="overflow-hidden p-6">
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-[13.5px] font-semibold text-ink-2">
                        Portfolio value
                        {primary && <span className="text-ink-3"> · {primary.title}</span>}
                      </div>
                      <div className="mt-0.5 font-mono text-[30px] font-bold text-ink">
                        {primary ? usd(primary.total) : '—'}
                      </div>
                    </div>
                    {allTimeReturn !== null && (
                      <Pill tone={allTimeReturn >= 0 ? 'up' : 'dn'}>
                        <Caret up={allTimeReturn >= 0} size={9} /> {signedPct(allTimeReturn)}{' '}
                        all-time
                      </Pill>
                    )}
                  </div>

                  <div className="-mx-1.5 mt-2 h-[170px]">
                    {primary && primary.series.length >= 2 ? (
                      <AreaChart
                        data={primary.series}
                        up={(allTimeReturn ?? 0) >= 0}
                        grid={false}
                        h={170}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center rounded-field border border-dashed border-line-2 px-6 text-center text-[13px] text-ink-3">
                        No performance history recorded yet.
                      </div>
                    )}
                  </div>

                  {asOf && (
                    <p className="mt-2 text-[11.5px] text-ink-3">
                      Standings and portfolio value as of {asOf}.
                    </p>
                  )}
                </Card>

                <BadgeGrid
                  tiles={badgeTiles}
                  earnedCount={earnedCount}
                  limit={badgeLimit}
                  loading={badgesLoading}
                  onShowAll={() => setBadgeLimit(badgeTiles.length)}
                />
              </div>

              {/* RIGHT */}
              <ActivityTimeline
                items={activity}
                visible={activityLimit}
                loading={activityLoading}
                onShowMore={() => setActivityLimit(activity.length)}
              />
            </div>
          </>
        )}
      </main>

      <BrandFooter />
    </div>
  );
};

/**
 * Held while the user doc and standings load. Only the hero, stat strip and
 * portfolio card are covered here — the badge grid and activity timeline carry
 * their own skeletons, since those fetches finish later.
 */
function ProfileSkeleton() {
  return (
    <div aria-busy="true">
      {/* HERO */}
      <Card
        className="relative mb-6 overflow-hidden p-6 md:p-8"
        style={{
          background:
            'radial-gradient(120% 160% at 0% 0%, rgba(139,92,246,.22), transparent 55%), #FFFFFF',
        }}
      >
        <div className="flex flex-wrap items-center gap-6 md:flex-nowrap md:gap-[26px]">
          <Skeleton className="h-[104px] w-[104px] shrink-0 rounded-full" />
          <div className="min-w-0 flex-1">
            <SkeletonText text="text-[32px]" bar="h-[32px] w-64 max-w-full rounded-md" />
            <SkeletonText text="text-[14px]" bar="h-3.5 w-72 max-w-full" className="mt-1" />
            <SkeletonText text="text-[13.5px]" bar="h-3.5 w-96 max-w-full" className="mt-2" />
            <div className="mt-[18px] max-w-[460px]">
              <div className="mb-[7px] flex justify-between">
                <SkeletonText text="text-[12.5px]" bar="h-3 w-28" />
                <SkeletonText text="text-[12.5px]" bar="h-3 w-24" />
              </div>
              <Skeleton className="h-[9px] rounded-md" />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* STAT STRIP */}
          <Card className="flex divide-x divide-line p-6">
            {['All-time return', 'Win rate', 'Best trade', 'Global rank'].map((label) => (
              <div key={label} className="min-w-0 flex-1 px-1">
                <div className="text-[12px] font-semibold uppercase tracking-[.05em] text-ink-3">
                  {label}
                </div>
                <SkeletonText
                  text="text-[24px]"
                  bar="h-[24px] w-20 rounded-md"
                  className="mt-1.5"
                />
              </div>
            ))}
          </Card>

          {/* PORTFOLIO */}
          <Card className="overflow-hidden p-6">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
              <div>
                <SkeletonText text="text-[13.5px]" bar="h-3.5 w-32" />
                <SkeletonText
                  text="text-[30px]"
                  bar="h-[30px] w-44 rounded-md"
                  className="mt-0.5"
                />
              </div>
              <Pill tone="mute">
                <Skeleton className="h-2.5 w-24" />
              </Pill>
            </div>
            <div className="-mx-1.5 mt-2 h-[170px]">
              <Skeleton className="h-full rounded-field" />
            </div>
            <SkeletonText text="text-[11.5px]" bar="h-2.5 w-56 max-w-full" className="mt-2" />
          </Card>

          {/* BADGES */}
          <Card className="p-6">
            <Skeleton className="mb-[18px] h-[19px] w-40" />
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: BADGES_PREVIEW }, (_, i) => (
                <div
                  key={i}
                  className="rounded-[14px] border border-line-2 bg-surface-2 px-2 py-[18px] text-center"
                >
                  <Skeleton className="mx-auto mb-2 h-[42px] w-[42px] rounded-full" />
                  {/* Names clamp to two lines; the rarity label sits below. */}
                  <SkeletonText
                    text="text-[12.5px] leading-tight"
                    bar="h-3 w-16"
                    className="mx-auto flex justify-center"
                  />
                  <SkeletonText
                    text="text-[12.5px] leading-tight"
                    bar="h-3 w-10"
                    className="mx-auto flex justify-center"
                  />
                  <SkeletonText
                    text="text-[10.5px]"
                    bar="h-2.5 w-12"
                    className="mx-auto mt-1 flex justify-center"
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ACTIVITY */}
        <Card className="p-6">
          <Skeleton className="mb-[18px] h-[18px] w-32" />
          {Array.from({ length: ACTIVITY_PREVIEW }, (_, i) => {
            const last = i === ACTIVITY_PREVIEW - 1;
            return (
              <div key={i} className={cn('relative flex gap-3.5', !last && 'pb-[22px]')}>
                <div className="flex flex-col items-center">
                  <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
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
        </Card>
      </div>
    </div>
  );
}

export default ProfilePage;
