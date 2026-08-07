import { cn } from '@/lib/utils';

/**
 * A placeholder block standing in for content that is still loading. Callers
 * size it (`h-3 w-20`) and may override the radius; the fill is surface-3, the
 * darker of the two surface tints, so bars stay legible inside a white Card.
 *
 * Skeletons must match the shape of what they replace — same row count, same
 * column widths — so nothing moves when the real data lands.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      role="presentation"
      className={cn('animate-pulse rounded bg-surface-3 motion-reduce:animate-none', className)}
    />
  );
}

/**
 * A skeleton bar that stands in for a *line of text*.
 *
 * A bare `<Skeleton className="h-3" />` is only as tall as the bar, but the
 * text it replaces is as tall as its line box — roughly 1.5× the font size.
 * Rows built from bare bars come out several pixels short each, and a list of
 * them visibly grows when the real rows arrive. Passing the same type scale
 * through `text` reproduces the line box exactly, so the row height matches.
 *
 *   <SkeletonText text="text-[14.5px]" bar="h-3.5 w-14" />
 */
export function SkeletonText({
  text,
  bar,
  className,
}: {
  /** The font-size utility of the text being replaced, e.g. `text-[14.5px]`. */
  text: string;
  /** Size of the bar itself, e.g. `h-3.5 w-20`. */
  bar: string;
  className?: string;
}) {
  return (
    <span className={cn('block', text, className)}>
      <Skeleton className={cn('inline-block align-middle', bar)} />
    </span>
  );
}

/**
 * Announces to assistive tech that a region has finished loading. Pair with
 * `aria-busy` on the region itself: the busy flag covers the wait, this covers
 * the resolution, which is otherwise silent.
 */
export function LoadedAnnouncement({ message }: { message: string }) {
  return (
    <span role="status" className="sr-only">
      {message}
    </span>
  );
}

export default Skeleton;
