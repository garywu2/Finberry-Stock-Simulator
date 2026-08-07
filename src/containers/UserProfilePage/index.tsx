import { useContext, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import UserContext from '@/context/user';
import {
  AreaChart,
  Avatar,
  BrandFooter,
  Pill,
  Skeleton,
  SkeletonText,
  TopNav,
} from '@/components/brand';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { signedPct, usd } from '@/lib/format';
import { leagueFor } from '@/containers/LeaderboardsPage/league';
import { relativeTime } from '@/containers/ProfilePage/ActivityTimeline';
import CompareCard from './CompareCard';
import { useUserProfile } from './useUserProfile';

const UserProfilePage = () => {
  const { email: raw } = useParams<{ email: string }>();
  const subjectEmail = raw ?? '';
  const { user } = useContext(UserContext) ?? { user: null };
  const viewerEmail: string | null = user?.email ?? null;

  const p = useUserProfile(subjectEmail, viewerEmail);
  const profile = p.profile;
  const isSelf = !!viewerEmail && viewerEmail.toLowerCase() === subjectEmail.toLowerCase();

  const displayName = useMemo(() => {
    if (!profile) return subjectEmail;
    const full = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
    return profile.preferredName?.trim() || full || profile.username || profile.email;
  }, [profile, subjectEmail]);

  const handle = profile?.username ? '@' + profile.username.toLowerCase().replace(/\s+/g, '.') : '';
  const league = p.subjectStanding
    ? leagueFor(p.subjectStanding.rank, p.subjectStanding.field)
    : null;

  const joined = profile?.createdAt ? new Date(profile.createdAt).getFullYear() : null;

  return (
    <div className="min-h-screen bg-bg font-sans text-ink">
      <TopNav active="Leaderboards" user={viewerEmail ?? 'Guest'} guest={!viewerEmail} />

      <main className="p-6 md:p-[30px]">
        <Link
          to="/Leaderboards"
          className="mb-[18px] inline-block text-[13.5px] font-semibold text-violet no-underline"
        >
          ← Back to leaderboards
        </Link>

        {p.error && (
          <p className="mb-4 rounded-field border border-down/30 bg-down-soft px-4 py-3 text-[13.5px] font-medium text-down">
            {p.error}
          </p>
        )}

        {p.loading ? (
          <InvestorSkeleton />
        ) : !profile ? (
          <p className="rounded-card border border-line bg-surface px-6 py-16 text-center text-[14px] text-ink-3">
            We couldn’t find that investor.
          </p>
        ) : (
          <>
            {/* HERO */}
            <Card className="mb-6 overflow-hidden p-0">
              <div
                className="relative h-[120px]"
                style={{ background: 'linear-gradient(115deg,#7C3AED,#16C078 130%)' }}
              >
                <div
                  className="absolute inset-0 opacity-25"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 85% -20%, #fff 0, transparent 45%)',
                  }}
                />
              </div>

              <div className="relative flex flex-wrap items-end gap-6 px-6 pb-7 md:px-8">
                <div className="-mt-[52px] rounded-full bg-surface p-[5px]">
                  <Avatar name={displayName} size={104} />
                </div>

                <div className="min-w-0 flex-1 pt-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="m-0 font-display text-[30px] font-bold tracking-[-.025em] text-ink">
                      {displayName}
                    </h1>
                    {p.subjectStanding?.rank === 1 && (
                      <Pill tone="gold">👑 #1 {p.subjectStanding.title}</Pill>
                    )}
                    {league && <Pill tone="violet">{league}</Pill>}
                  </div>
                  <div className="mt-1.5 font-mono text-[13.5px] text-ink-3">
                    {[handle, joined && `investing since ${joined}`, profile.location?.trim()]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                  {profile.bio?.trim() && (
                    <p className="mt-2 max-w-[520px] text-[13.5px] leading-[1.5] text-ink-2">
                      {profile.bio.trim()}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3 pt-5" aria-busy={p.followLoading}>
                  <div className="flex gap-6">
                    {[
                      // Follower counts arrive separately; badges come with the
                      // profile, so that one is already known.
                      [p.follow.followers, 'followers', p.followLoading],
                      [p.follow.following, 'following', p.followLoading],
                      [profile.badges.length, 'badges', false],
                    ].map(([n, label, pending]) => (
                      <div key={label as string} className="text-center">
                        {pending ? (
                          <Skeleton className="mx-auto h-[19px] w-10 rounded-md" />
                        ) : (
                          <div className="font-display font-mono text-[19px] font-extrabold text-ink">
                            {Number(n).toLocaleString('en-US')}
                          </div>
                        )}
                        <div className="text-[12px] text-ink-3">{label as string}</div>
                      </div>
                    ))}
                  </div>
                  {viewerEmail &&
                    !isSelf &&
                    (p.followLoading ? (
                      // "+ Follow" vs "Following" is a claim about the viewer's
                      // own state — don't render either until it's known.
                      <Skeleton className="h-[42px] w-[104px] rounded-btn" />
                    ) : (
                      <Button
                        variant={p.follow.viewerFollows ? 'ghost' : 'primary'}
                        onClick={p.toggleFollow}
                        aria-pressed={p.follow.viewerFollows}
                      >
                        {p.follow.viewerFollows ? 'Following' : '+ Follow'}
                      </Button>
                    ))}
                  {isSelf && (
                    <Link
                      to={`/Profile/${encodeURIComponent(subjectEmail)}`}
                      className="text-[13px] font-semibold text-violet no-underline"
                    >
                      This is you — open your profile →
                    </Link>
                  )}
                </div>
              </div>
            </Card>

            <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
              {/* LEFT */}
              <div className="flex min-w-0 flex-col gap-6">
                {/* STATS */}
                <Card className="flex divide-x divide-line p-6">
                  <Stat
                    label="All-time return"
                    value={p.subjectReturn == null ? '—' : signedPct(p.subjectReturn)}
                    tone={
                      p.subjectReturn == null ? undefined : p.subjectReturn >= 0 ? 'up' : 'down'
                    }
                  />
                  <Stat
                    label="Global rank"
                    value={p.subjectStanding ? `#${p.subjectStanding.rank}` : '—'}
                    tone={p.subjectStanding ? 'gold' : undefined}
                  />
                  <Stat
                    label="Win rate"
                    value={p.subjectWinRate == null ? '—' : `${Math.round(p.subjectWinRate)}%`}
                  />
                  <Stat label="Positions" value={String(profile.holdings.length)} tone="violet" />
                </Card>

                {/* PERFORMANCE */}
                {profile.privacy.leaderboard ? (
                  <Card className="overflow-hidden p-6">
                    <div className="mb-1">
                      <div className="text-[13.5px] font-semibold text-ink-2">
                        Portfolio value <span className="font-medium text-ink-3">· public</span>
                      </div>
                      <div className="mt-0.5 font-mono text-[30px] font-bold text-ink">
                        {p.subjectStanding ? usd(p.subjectStanding.total) : '—'}
                      </div>
                    </div>
                    <div className="-mx-1.5 mt-3 h-[200px]">
                      {p.subjectStanding && p.subjectStanding.series.length >= 2 ? (
                        <AreaChart
                          data={p.subjectStanding.series}
                          up={(p.subjectReturn ?? 0) >= 0}
                          h={200}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center rounded-field border border-dashed border-line-2 px-6 text-center text-[13px] text-ink-3">
                          No performance history recorded yet.
                        </div>
                      )}
                    </div>
                    {p.subjectStanding?.asOf && (
                      <p className="mt-2 text-[11.5px] text-ink-3">
                        Standings as of{' '}
                        {new Date(p.subjectStanding.asOf).toLocaleDateString(undefined, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                        .
                      </p>
                    )}
                  </Card>
                ) : (
                  <Hidden what="performance" />
                )}

                {/* TOP HOLDINGS */}
                {profile.privacy.simulator ? (
                  <Card className="overflow-hidden p-0">
                    <div className="flex items-center justify-between gap-4 px-6 pb-3.5 pt-5">
                      <h2 className="m-0 font-display text-[19px] font-bold text-ink">
                        Top holdings
                      </h2>
                      <span className="text-[12.5px] text-ink-3">
                        Shared publicly by {displayName}
                      </span>
                    </div>
                    {!p.topHoldings.length ? (
                      <p className="border-t border-line px-6 py-8 text-center text-[13.5px] text-ink-3">
                        No open positions.
                      </p>
                    ) : (
                      p.topHoldings.map((h) => (
                        <div
                          key={h.symbol}
                          className="grid grid-cols-[1.7fr_1.3fr_1fr] items-center gap-3 border-t border-line px-6 py-3"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-surface-3 font-display text-[13px] font-bold text-violet">
                              {h.symbol.slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <Link
                                to={`/stock/${h.symbol}`}
                                className="block font-mono text-[14.5px] font-semibold text-ink no-underline"
                              >
                                {h.symbol}
                              </Link>
                              <div className="truncate text-[12.5px] text-ink-3">{h.index}</div>
                            </div>
                          </div>
                          <div>
                            <div className="mb-1.5 flex justify-between text-[11.5px] text-ink-3">
                              <span>Allocation</span>
                              <span className="font-mono">{h.allocation.toFixed(0)}%</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded bg-surface-3">
                              <div
                                className="h-full rounded bg-violet"
                                style={{ width: `${Math.min(100, h.allocation)}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-right font-mono text-[14px] font-semibold text-ink">
                            {h.quantity} sh
                          </span>
                        </div>
                      ))
                    )}
                  </Card>
                ) : (
                  <Hidden what="holdings" />
                )}
              </div>

              {/* RIGHT */}
              <div className="flex flex-col gap-6">
                {/* ACHIEVEMENTS */}
                {profile.privacy.badges ? (
                  <Card className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="m-0 font-display text-[18px] font-bold text-ink">
                        Achievements
                      </h2>
                      <Pill tone="gold">{profile.badges.length} earned</Pill>
                    </div>
                    {!profile.badges.length ? (
                      <p className="py-4 text-center text-[13.5px] text-ink-3">No badges yet.</p>
                    ) : (
                      <div className="grid grid-cols-6 gap-2">
                        {profile.badges.slice(0, 18).map((b) => (
                          <div
                            key={b._id}
                            title={b.displayName ?? undefined}
                            className="flex aspect-square items-center justify-center rounded-xl border border-line-2 bg-surface-2 font-display text-[13px] font-bold text-violet"
                          >
                            {(b.displayName ?? '?').slice(0, 2)}
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                ) : (
                  <Hidden what="badges" />
                )}

                {/* ACTIVITY */}
                {profile.privacy.simulator && profile.trades.length > 0 && (
                  <Card className="p-6">
                    <h2 className="mb-[18px] mt-0 font-display text-[18px] font-bold text-ink">
                      Recent activity
                    </h2>
                    {profile.trades.slice(0, 4).map((t, i, arr) => {
                      const buy = Number(t.transactionType) === 1;
                      const last = i === arr.length - 1;
                      return (
                        <div key={t._id} className={cn('flex gap-3.5', !last && 'pb-5')}>
                          <div className="flex flex-col items-center">
                            <div
                              className={cn(
                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line-2 bg-surface-2 text-[13px]',
                                buy ? 'text-up' : 'text-down'
                              )}
                              aria-hidden="true"
                            >
                              {buy ? '▲' : '▼'}
                            </div>
                            {!last && <div className="mt-1 w-px flex-1 bg-line-2" />}
                          </div>
                          <div className="min-w-0 pt-0.5">
                            <div className="text-[14px] font-semibold leading-[1.35] text-ink">
                              {buy ? 'Bought' : 'Sold'} {t.quantity} {t.symbol}
                            </div>
                            <div className="mt-0.5 text-[12.5px] text-ink-3">@ {usd(t.price)}</div>
                            <div className="mt-1 font-mono text-[11.5px] text-ink-3 opacity-85">
                              {relativeTime(t.transactionTime)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </Card>
                )}

                {/* COMPARE — designed here; see CompareCard for the rationale.
                    The viewer's own trades and holdings load separately, and a
                    comparison drawn from an empty set would be plain wrong. */}
                {viewerEmail && !isSelf && p.compareLoading && (
                  <Card className="border-line-2 p-[22px]" aria-busy="true">
                    <Skeleton className="mb-1 h-[15px] w-40" />
                    <Skeleton className="mb-1.5 mt-2.5 h-3.5 w-full" />
                    <Skeleton className="mb-3.5 h-3.5 w-2/3" />
                    <Skeleton className="h-[42px] rounded-btn" />
                  </Card>
                )}
                {!p.compareLoading && p.compare && !isSelf && (
                  <CompareCard you={p.compare.you} them={p.compare.them} themName={displayName} />
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <BrandFooter />
    </div>
  );
};

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'up' | 'down' | 'gold' | 'violet';
}) {
  return (
    <div className="min-w-0 flex-1 px-1">
      <div className="text-[12px] font-semibold uppercase tracking-[.05em] text-ink-3">{label}</div>
      <div
        className={cn(
          'mt-1.5 font-mono text-[24px] font-bold',
          tone === 'up' && 'text-up',
          tone === 'down' && 'text-down',
          tone === 'gold' && 'text-gold',
          tone === 'violet' && 'text-violet',
          !tone && 'text-ink'
        )}
      >
        {value}
      </div>
    </div>
  );
}

/**
 * Held while the public profile and standings load. Mirrors the hero banner,
 * the four-stat strip, the performance card's 200px well, the five-row top
 * holdings table and the two sidebar cards.
 */
function InvestorSkeleton() {
  return (
    <div aria-busy="true">
      {/* HERO */}
      <Card className="mb-6 overflow-hidden p-0">
        <div
          className="h-[120px]"
          style={{ background: 'linear-gradient(115deg,#7C3AED,#16C078 130%)' }}
        />
        <div className="relative flex flex-wrap items-end gap-6 px-6 pb-7 md:px-8">
          <div className="-mt-[52px] rounded-full bg-surface p-[5px]">
            <Skeleton className="h-[104px] w-[104px] rounded-full" />
          </div>
          <div className="min-w-0 flex-1 pt-5">
            <SkeletonText text="text-[30px]" bar="h-[30px] w-56 max-w-full rounded-md" />
            <SkeletonText text="text-[13.5px]" bar="h-3.5 w-72 max-w-full" className="mt-1.5" />
            <SkeletonText text="text-[13.5px]" bar="h-3.5 w-[420px] max-w-full" className="mt-2" />
          </div>
          <div className="flex flex-col items-end gap-3 pt-5">
            <div className="flex gap-6">
              {['followers', 'following', 'badges'].map((label) => (
                <div key={label} className="text-center">
                  <SkeletonText
                    text="text-[19px]"
                    bar="h-[19px] w-10 rounded-md"
                    className="mx-auto flex justify-center"
                  />
                  <div className="text-[12px] text-ink-3">{label}</div>
                </div>
              ))}
            </div>
            <Skeleton className="h-[42px] w-[104px] rounded-btn" />
          </div>
        </div>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* STATS */}
          <Card className="flex divide-x divide-line p-6">
            {['All-time return', 'Global rank', 'Win rate', 'Positions'].map((label) => (
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

          {/* PERFORMANCE */}
          <Card className="overflow-hidden p-6">
            <SkeletonText text="text-[13.5px]" bar="h-3.5 w-40" />
            <SkeletonText text="text-[30px]" bar="h-[30px] w-44 rounded-md" className="mt-0.5" />
            <div className="-mx-1.5 mt-3 h-[200px]">
              <Skeleton className="h-full rounded-field" />
            </div>
            <SkeletonText text="text-[11.5px]" bar="h-2.5 w-56 max-w-full" className="mt-2" />
          </Card>

          {/* TOP HOLDINGS — capped at five */}
          <Card className="overflow-hidden p-0">
            <div className="flex items-center justify-between px-6 pb-3.5 pt-5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            {/* Three placeholder rows — the same reservation the holdings table
                makes. The real list runs to five but is usually shorter. */}
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="grid grid-cols-[1.7fr_1.3fr_1fr] items-center gap-3 border-t border-line px-6 py-3"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-[38px] w-[38px] rounded-[10px]" />
                  <div className="min-w-0 flex-1">
                    <SkeletonText text="text-[14.5px]" bar="h-3.5 w-14" />
                    <SkeletonText text="text-[12.5px]" bar="h-3 w-20" />
                  </div>
                </div>
                <div>
                  <SkeletonText text="text-[12.5px]" bar="h-3 w-16" />
                  <Skeleton className="mt-1.5 h-1.5 rounded" />
                </div>
                <SkeletonText text="text-[14px]" bar="h-3.5 w-16" className="text-right" />
              </div>
            ))}
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          {/* ACHIEVEMENTS */}
          <Card className="p-6">
            <Skeleton className="mb-[18px] h-4 w-32" />
            {/* One row of the six-column grid; the real grid caps at 18 but
                most investors have far fewer, so reserving all 18 overshoots. */}
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          </Card>

          {/* RECENT ACTIVITY */}
          <Card className="p-6">
            <Skeleton className="mb-[18px] h-4 w-32" />
            {[0, 1, 2, 3].map((i) => {
              const last = i === 3;
              return (
                <div key={i} className={cn('flex gap-3.5', !last && 'pb-5')}>
                  <div className="flex flex-col items-center">
                    <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                    {!last && <div className="mt-1 w-px flex-1 bg-line-2" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <SkeletonText text="text-[14px]" bar="h-3.5 w-40 max-w-full" />
                    <SkeletonText text="text-[12.5px]" bar="h-3 w-28" className="mt-0.5" />
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </div>
  );
}

/** Shown where the investor has switched a section off in their privacy settings. */
function Hidden({ what }: { what: string }) {
  return (
    <Card className="p-6 text-center text-[13.5px] text-ink-3">
      This investor keeps their {what} private.
    </Card>
  );
}

export default UserProfilePage;
