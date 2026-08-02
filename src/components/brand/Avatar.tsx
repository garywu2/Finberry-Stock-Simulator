// Deterministic gradient-monogram avatar. The gradient is picked from the
// name's first two char codes so a given name always renders the same orb.
// Ported from fb-shared.jsx Avatar.
const AV_GRADS: [string, string][] = [
  ['#A989FF', '#6D28D9'],
  ['#2BE08C', '#0E8F57'],
  ['#FF7AB8', '#C026A3'],
  ['#FFC65C', '#E08A1E'],
  ['#62B6FF', '#2563EB'],
  ['#FF8A5C', '#D9480F'],
  ['#7AE0D0', '#0E8F8F'],
  ['#C58BFF', '#7C3AED'],
  ['#FF5D8F', '#B01254'],
  ['#9BE05C', '#4F9E0E'],
];

export function Avatar({
  name = '?',
  size = 44,
  ring,
}: {
  name?: string;
  size?: number;
  /** Ring color, e.g. "#7C3AED". Omit for no ring. */
  ring?: string;
}) {
  const i = (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % AV_GRADS.length;
  const [a, b] = AV_GRADS[i];
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-display font-bold text-white"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(140deg, ${a}, ${b})`,
        fontSize: size * 0.4,
        letterSpacing: '-.02em',
        boxShadow: ring ? `0 0 0 2px #F5F1FB, 0 0 0 ${size * 0.06 + 2}px ${ring}` : 'none',
      }}
    >
      {initials}
    </div>
  );
}

export default Avatar;
