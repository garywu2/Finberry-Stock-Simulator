import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '@/api/client';
import UserContext from '@/context/user';
import { BrandFooter, Pill, TopNav } from '@/components/brand';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LessonThumb from '../ArticlesPage/LessonThumb';
import type { Lesson, LessonProgress } from '../ArticlesPage/types';

// NOTE: no lesson-detail screen was ever designed (see the redesign roadmap).
// This is a deliberately plain reading view built from existing brand
// primitives so it doesn't clash with the redesigned hub — flag for a design
// pass before adding anything more to it.
const LessonPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useContext(UserContext) ?? { user: null };
  const email: string | null = user?.email ?? null;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [percent, setPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    api
      .get<Lesson[]>('educational/lesson', { params: { _id: id, moreDetails: true } })
      .then((res) => {
        if (cancelled) return;
        const doc = Array.isArray(res.data) ? res.data[0] : null;
        setLesson(doc ?? null);
        if (!doc) setError('That lesson could not be found.');
      })
      .catch(() => {
        if (!cancelled) setError('That lesson could not be loaded.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!email || !id) return;
    let cancelled = false;
    api
      .get<LessonProgress[]>('educational/lessonprogress', { params: { email, lesson: id } })
      .then((res) => {
        if (cancelled) return;
        setPercent(Array.isArray(res.data) ? (res.data[0]?.percentComplete ?? 0) : 0);
      })
      .catch(() => {
        /* Progress is optional. */
      });
    return () => {
      cancelled = true;
    };
  }, [email, id]);

  const toggleDone = async () => {
    if (!email || !id) return;
    const next = percent >= 100 ? 0 : 100;
    setPercent(next);
    try {
      await api.put('educational/lessonprogress', { email, lesson: id, percentComplete: next });
    } catch {
      setError('Could not save your progress.');
      setPercent(percent);
    }
  };

  return (
    <div className="min-h-screen bg-bg font-sans text-ink">
      <TopNav active="Learn" user={email ?? 'Guest'} guest={!email} />

      <main className="mx-auto max-w-[760px] p-6 md:p-[30px]">
        <Link
          to="/Articles"
          className="text-[13.5px] font-semibold text-violet no-underline hover:brightness-110"
        >
          ← Back to Learn
        </Link>

        {error && (
          <p className="mt-4 rounded-field border border-down/30 bg-down-soft px-4 py-3 text-[13.5px] font-medium text-down">
            {error}
          </p>
        )}

        {loading ? (
          <div className="mt-4 h-[420px] animate-pulse rounded-card border border-line bg-surface-2" />
        ) : (
          lesson && (
            <Card className="mt-4 overflow-hidden p-0">
              <LessonThumb category={lesson.category} height={200} label={lesson.category} />
              <article className="p-6 md:p-8">
                <div className="mb-3 flex flex-wrap items-center gap-2.5">
                  <Pill tone="violet">{lesson.category}</Pill>
                  <span className="font-mono text-[12.5px] text-ink-3">
                    {lesson.estimatedMinutes} min read
                  </span>
                  {percent >= 100 && <Pill tone="up">Completed</Pill>}
                </div>

                <h1 className="m-0 font-display text-[30px] font-bold leading-[1.2] tracking-[-.025em] text-ink">
                  {lesson.title}
                </h1>
                <p className="mt-1.5 text-[13.5px] text-ink-3">
                  by {lesson.author} ·{' '}
                  {new Date(lesson.firstPosted).toLocaleDateString(undefined, {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>

                <p className="mt-5 whitespace-pre-line text-[15.5px] leading-[1.65] text-ink-2">
                  {lesson.content}
                </p>

                {lesson.externalLink && lesson.externalLink !== 'N/A' && (
                  <p className="mt-5 text-[14px]">
                    <a
                      href={lesson.externalLink}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="font-semibold text-violet"
                    >
                      Read the original source →
                    </a>
                  </p>
                )}

                {email && (
                  <div className="mt-7 border-t border-line pt-5">
                    <Button variant={percent >= 100 ? 'ghost' : 'primary'} onClick={toggleDone}>
                      {percent >= 100 ? 'Mark as unread' : 'Mark as done'}
                    </Button>
                  </div>
                )}
              </article>
            </Card>
          )
        )}
      </main>

      <BrandFooter />
    </div>
  );
};

export default LessonPage;
