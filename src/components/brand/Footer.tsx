import { Link } from 'react-router-dom';
import { Logo } from './Logo';

// Marketing footer. Ported from the inline footer in fb-landing.jsx (the design
// system has no footer primitive). Links map to existing routes where present.
const LINKS = [
  { label: 'About', to: '/About' },
  { label: 'Learn', to: '/Articles' },
  { label: 'Pricing', to: '/BuyPremium' },
  { label: 'Contact', to: '/Contact' },
  { label: 'FAQ', to: '/FAQ' },
  { label: 'Privacy', to: '/Privacy' },
];

export function BrandFooter() {
  return (
    <footer className="flex items-center justify-between border-t border-line px-[60px] py-9">
      <Logo size={24} to="/" />
      <nav className="flex items-center gap-6">
        {LINKS.map((l) => (
          <Link
            key={l.label}
            to={l.to}
            className="text-[13.5px] text-ink-3 no-underline hover:text-ink-2"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <span className="text-[12.5px] text-ink-3">
        © 2026 Finberry · Simulated trading. Not financial advice.
      </span>
    </footer>
  );
}

export default BrandFooter;
