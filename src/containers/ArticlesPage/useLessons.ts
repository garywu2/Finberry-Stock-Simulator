import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '@/api/client';
import type { Lesson, LessonCard, LessonProgress } from './types';

function serverMessage(e: unknown, fallback: string) {
  const msg = (e as { response?: { data?: { msg?: string } } })?.response?.data?.msg;
  return typeof msg === 'string' && msg ? msg : fallback;
}

export function useLessons(email: string | null) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get<Lesson[]>('educational/lesson')
      .then((res) => {
        if (cancelled) return;
        const rows = Array.isArray(res.data) ? res.data : [];
        setLessons(rows.filter((l) => l.published !== false));
      })
      .catch((e) => {
        if (!cancelled) setError(serverMessage(e, 'Could not load lessons.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!email) return;
    let cancelled = false;
    api
      .get<LessonProgress[]>('educational/lessonprogress', { params: { email } })
      .then((res) => {
        if (cancelled) return;
        setProgress(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        // Progress is additive; a failure just means nothing is marked done.
      });
    return () => {
      cancelled = true;
    };
  }, [email]);

  const progressByLesson = useMemo(() => {
    const m = new Map<string, number>();
    progress.forEach((p) => m.set(p.lesson, p.percentComplete));
    return m;
  }, [progress]);

  const cards = useMemo<LessonCard[]>(
    () =>
      lessons.map((l) => {
        const pct = progressByLesson.get(l._id) ?? 0;
        return { ...l, percentComplete: pct, completed: pct >= 100 };
      }),
    [lessons, progressByLesson]
  );

  /** Record progress, updating local state so the UI responds immediately. */
  const setLessonProgress = useCallback(
    async (lessonId: string, percentComplete: number) => {
      if (!email) return;
      setProgress((prev) => {
        const next = prev.filter((p) => p.lesson !== lessonId);
        return [
          ...next,
          {
            _id: 'local-' + lessonId,
            user: 'me',
            lesson: lessonId,
            percentComplete,
            completedAt: percentComplete >= 100 ? new Date().toISOString() : null,
            lastViewedAt: new Date().toISOString(),
          },
        ];
      });
      try {
        await api.put('educational/lessonprogress', {
          email,
          lesson: lessonId,
          percentComplete,
        });
      } catch (e) {
        setError(serverMessage(e, 'Could not save your progress.'));
      }
    },
    [email]
  );

  const completedCount = cards.filter((c) => c.completed).length;

  /** The lesson to resume: furthest started but unfinished, else the first unseen. */
  const upNext = useMemo(() => {
    const started = cards.filter((c) => c.percentComplete > 0 && !c.completed);
    if (started.length) return started[0];
    return cards.find((c) => c.percentComplete === 0) ?? null;
  }, [cards]);

  return {
    cards,
    loading,
    error,
    completedCount,
    upNext,
    setLessonProgress,
  };
}
