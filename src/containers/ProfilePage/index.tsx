import { useContext, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import UserContext from '@/context/user';
import { AreaChart, BrandFooter, Caret, Pill, TopNav } from '@/components/brand';
import { Card } from '@/components/ui/card';
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
      <TopNav user={displayName} balance={usd(primary?.total ?? 0)} />

      <main className="p-6 md:p-[30px]">
        {error && (
          <p className="mb-4 rounded-field border border-down/30 bg-down-soft px-4 py-3 text-[13.5px] font-medium text-down">
            {error}
          </p>
        )}

        {loading ? (
          <div className="h-[220px] animate-pulse rounded-card border border-line bg-surface-2" />
        ) : (
          <>
            <ProfileHero
              user={user}
              displayName={displayName}
              league={league}
              earnedCount={earnedCount}
              totalBadges={totalBadges}
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
                  onShowAll={() => setBadgeLimit(badgeTiles.length)}
                />
              </div>

              {/* RIGHT */}
              <ActivityTimeline
                items={activity}
                visible={activityLimit}
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

export default ProfilePage;
