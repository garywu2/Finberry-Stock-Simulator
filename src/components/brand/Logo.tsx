import { Link } from 'react-router-dom';
import { BerryMark } from './BerryMark';

// Berry mark + "finberry" wordmark. Ported from fb-shared.jsx Logo. When `to`
// is provided the whole lockup links (used in the nav); otherwise it renders
// as a plain inline lockup.
export function Logo({
  size = 30,
  to,
  className,
}: {
  size?: number;
  to?: string;
  className?: string;
}) {
  const inner = (
    <span className="flex items-center gap-[9px]">
      <BerryMark size={size} />
      <span
        className="font-display font-bold text-ink"
        style={{ fontSize: size * 0.66, letterSpacing: '-.04em' }}
      >
        finberry
      </span>
    </span>
  );

  if (to) {
    return (
      <Link to={to} className={className} style={{ textDecoration: 'none' }}>
        {inner}
      </Link>
    );
  }
  return <span className={className}>{inner}</span>;
}

export default Logo;
