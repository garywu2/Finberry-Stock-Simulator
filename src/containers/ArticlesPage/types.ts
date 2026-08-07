export const LESSON_CATEGORIES = [
  'Basics',
  'Markets',
  'Strategy',
  'Risk',
  'Crypto',
  'Retirement',
] as const;

export type LessonCategory = (typeof LESSON_CATEGORIES)[number];

export interface Lesson {
  _id: string;
  title: string;
  description: string;
  /** Omitted by the list endpoint unless moreDetails=true. */
  content?: string;
  category: LessonCategory;
  pathKey: string | null;
  order: number;
  estimatedMinutes: number;
  externalLink?: string;
  author: string;
  published: boolean;
  firstPosted: string;
  dateLastUpdated: string;
}

export interface LessonProgress {
  _id: string;
  user: string;
  lesson: string;
  percentComplete: number;
  completedAt: string | null;
  lastViewedAt: string;
}

/** A lesson with the viewer's progress attached. */
export interface LessonCard extends Lesson {
  percentComplete: number;
  completed: boolean;
}
