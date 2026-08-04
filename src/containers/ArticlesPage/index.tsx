import { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import UserContext from '@/context/user';
import { BrandFooter, Pill, TopNav } from '@/components/brand';
import { Card } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import LessonThumb from './LessonThumb';
import { useLessons } from './useLessons';
import { LESSON_CATEGORIES, type LessonCard, type LessonCategory } from './types';

const CATEGORY_TONE: Record<LessonCategory, 'violet' | 'up' | 'pink' | 'gold' | 'mute'> = {
  Basics: 'violet',
  Markets: 'pink',
  Strategy: 'up',
  Risk: 'gold',
  Crypto: 'mute',
  Retirement: 'mute',
};

const ALL = 'All' as const;

const ArticlesPage = () => {
  const { user } = useContext(UserContext) ?? { user: null };
  const email: string | null = user?.email ?? null;

  const { cards, loading, error, completedCount, upNext, setLessonProgress } = useLessons(email);
  const [category, setCategory] = useState<LessonCategory | typeof ALL>(ALL);

  // Only offer chips for categories that actually have lessons.
  const availableCategories = useMemo(() => {
    const present = new Set(cards.map((c) => c.category));
    return LESSON_CATEGORIES.filter((c) => present.has(c));
  }, [cards]);

  const featured = cards[0] ?? null;
  const rest = useMemo(() => cards.slice(1), [cards]);

  const visible = useMemo(
    () => (category === ALL ? rest : rest.filter((l) => l.category === category)),
    [rest, category]
  );

  const totalMinutes = cards.reduce((sum, c) => sum + (c.estimatedMinutes || 0), 0);

  return (
    <div className="min-h-screen bg-bg font-sans text-ink">
      <TopNav active="Learn" user={email ?? 'Guest'} guest={!email} />

      <main className="p-6 md:p-[30px]">
        <div className="mb-6">
          <div className="text-[13px] font-semibold uppercase tracking-[.04em] text-ink-3">
            Learn hub
          </div>
          <h1 className="m-0 mt-1.5 font-display text-[34px] font-bold tracking-[-.025em] text-ink">
            Grow your money smarts
          </h1>
        </div>

        {error && (
          <p className="mb-4 rounded-field border border-down/30 bg-down-soft px-4 py-3 text-[13.5px] font-medium text-down">
            {error}
          </p>
        )}

        {loading ? (
          <div className="h-[320px] animate-pulse rounded-card border border-line bg-surface-2" />
        ) : !cards.length ? (
          <p className="rounded-card border border-line bg-surface px-6 py-16 text-center text-[14px] text-ink-3">
            No lessons have been published yet.
          </p>
        ) : (
          <>
            {/* FEATURED + CONTINUE */}
            <div className="mb-7 grid items-stretch gap-6 lg:grid-cols-[1fr_380px]">
              {featured && (
                <Card className="flex flex-col overflow-hidden p-0">
                  <LessonThumb category={featured.category} height={260} label="Featured" />
                  <div className="flex flex-1 flex-col p-[26px]">
                    <div className="mb-3">
                      <Pill tone="violet">START HERE</Pill>
                    </div>
                    <h2 className="m-0 mb-2.5 font-display text-[26px] font-bold leading-[1.15] text-ink">
                      {featured.title}
                    </h2>
                    <p className="m-0 mb-[18px] text-[15px] leading-[1.55] text-ink-2">
                      {featured.description}
                    </p>
                    <div className="mt-auto flex flex-wrap items-center gap-3.5">
                      <Link
                        to={`/Article/${featured._id}`}
                        className={cn(buttonVariants(), 'no-underline')}
                      >
                        {featured.percentComplete > 0 ? 'Keep reading' : 'Start learning'}
                      </Link>
                      <span className="font-mono text-[13px] text-ink-3">
                        {cards.length} lesson{cards.length === 1 ? '' : 's'} · ~{totalMinutes} min
                      </span>
                    </div>
                  </div>
                </Card>
              )}

              {/* CONTINUE LEARNING — real progress */}
              <Card
                className="p-6"
                style={{ background: 'linear-gradient(160deg, rgba(43,224,140,.08), transparent)' }}
              >
                <h2 className="m-0 mb-1 font-display text-[18px] font-bold text-ink">
                  Continue learning
                </h2>
                <div className="mb-[18px] text-[13px] text-ink-3">
                  {!email
                    ? 'Log in to track your progress'
                    : upNext
                      ? `${completedCount} of ${cards.length} lessons complete`
                      : 'You’ve completed every lesson 🎉'}
                </div>

                {cards.slice(0, 3).map((l, i) => (
                  <ProgressRow
                    key={l._id}
                    lesson={l}
                    first={i === 0}
                    canTrack={!!email}
                    onToggle={() => setLessonProgress(l._id, l.completed ? 0 : 100)}
                  />
                ))}
              </Card>
            </div>

            {/* CATEGORY CHIPS */}
            {availableCategories.length > 1 && (
              <div
                className="mb-[22px] flex flex-wrap gap-2.5"
                role="group"
                aria-label="Filter by category"
              >
                {[ALL, ...availableCategories].map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={category === c}
                    onClick={() => setCategory(c)}
                    className={cn(
                      'cursor-pointer rounded-pill px-4 py-2 text-[13.5px] font-semibold transition-colors',
                      category === c
                        ? 'border border-transparent bg-violet text-white'
                        : 'border border-line bg-surface-2 text-ink-2 hover:text-ink'
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            {/* GRID */}
            {!visible.length ? (
              <p className="rounded-card border border-line bg-surface px-6 py-12 text-center text-[13.5px] text-ink-3">
                No lessons in {category} yet.
              </p>
            ) : (
              <div className="grid gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((l) => (
                  <Link
                    key={l._id}
                    to={`/Article/${l._id}`}
                    className="block no-underline transition-transform hover:-translate-y-0.5"
                  >
                    <Card className="h-full overflow-hidden p-0">
                      <LessonThumb category={l.category} height={150} />
                      <div className="p-5">
                        <div className="mb-2.5 flex flex-wrap items-center gap-2.5">
                          <Pill tone={CATEGORY_TONE[l.category] ?? 'mute'}>{l.category}</Pill>
                          <span className="font-mono text-[12px] text-ink-3">
                            {l.estimatedMinutes} min read
                          </span>
                          {l.completed && <Pill tone="up">Done</Pill>}
                        </div>
                        <h3 className="m-0 font-display text-[18px] font-bold leading-[1.25] text-ink">
                          {l.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-[13px] text-ink-2">{l.description}</p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <BrandFooter />
    </div>
  );
};

function ProgressRow({
  lesson,
  first,
  canTrack,
  onToggle,
}: {
  lesson: LessonCard;
  first: boolean;
  canTrack: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={cn('flex items-center gap-3.5 py-3', !first && 'border-t border-line')}>
      <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[11px] bg-surface-2 text-[19px]">
        {lesson.completed ? '✅' : '📘'}
      </div>
      <div className="min-w-0 flex-1">
        <Link
          to={`/Article/${lesson._id}`}
          className={cn(
            'block truncate text-[14px] font-semibold no-underline',
            lesson.percentComplete > 0 ? 'text-ink' : 'text-ink-2'
          )}
        >
          {lesson.title}
        </Link>
        <div className="mt-[7px] h-[5px] overflow-hidden rounded bg-surface-3">
          <div className="h-full rounded bg-up" style={{ width: `${lesson.percentComplete}%` }} />
        </div>
      </div>
      {canTrack ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          aria-label={
            lesson.completed ? `Mark ${lesson.title} unread` : `Mark ${lesson.title} done`
          }
        >
          {lesson.completed ? 'Undo' : 'Done'}
        </Button>
      ) : (
        <span className="w-[34px] text-right font-mono text-[12px] text-ink-3">
          {lesson.percentComplete ? `${lesson.percentComplete}%` : '—'}
        </span>
      )}
    </div>
  );
}

export default ArticlesPage;
