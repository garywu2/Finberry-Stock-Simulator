import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { Avatar } from './Avatar';
import { buttonVariants } from '@/components/ui/button';

// App chrome: sticky translucent header with the primary nav, cash chip,
// notifications, and avatar. Guest variant drops the nav for Log in / Get
// started. Ported from fb-shared.jsx TopNav and wired to the router.
const LINKS = [
  { label: 'Simulator', to: '/SimulatorPortfolio' },
  { label: 'Markets', to: '/Markets' },
  { label: 'Leaderboards', to: '/Leaderboards' },
  { label: 'Learn', to: '/Articles' },
];

export function TopNav({
  active,
  user = 'Maya Chen',
  balance = '$0.00',
  guest = false,
}: {
  /** Label of the active nav item; defaults to matching the current path. */
  active?: string;
  user?: string;
  balance?: string;
  guest?: boolean;
}) {
  const { pathname } = useLocation();

  const isActive = (link: (typeof LINKS)[number]) =>
    active ? active === link.label : pathname.toLowerCase().startsWith(link.to.toLowerCase());

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-8 border-b border-line bg-white/80 px-[30px] backdrop-blur-[12px]">
      <Logo size={28} to="/" />

      {!guest && (
        <nav className="ml-2 flex items-center gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className={cn(
                'rounded-[10px] px-[14px] py-[7px] text-[14.5px] no-underline transition-colors',
                isActive(l)
                  ? 'bg-violet-soft font-bold text-violet'
                  : 'font-medium text-ink-2 hover:text-ink'
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}

      <div className="flex-1" />

      {guest ? (
        <div className="flex items-center gap-3">
          <Link to="/Login" className="text-[14.5px] font-medium text-ink-2 no-underline">
            Log in
          </Link>
          <Link to="/Register" className={cn(buttonVariants(), 'no-underline')}>
            Get started
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 rounded-field border border-line bg-surface-2 py-[7px] pl-3 pr-[14px]">
            <span className="text-[11px] font-bold uppercase tracking-[.06em] text-ink-3">
              Cash
            </span>
            <span className="font-mono text-[14px] font-semibold text-ink">{balance}</span>
          </div>
          <button aria-label="Notifications" className="flex items-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5F5577"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.7 21a2 2 0 0 1-3.4 0" />
            </svg>
          </button>
          <Avatar name={user} size={36} ring="#7C3AED" />
        </div>
      )}
    </header>
  );
}

export default TopNav;
