// The Finberry berry logo mark. Inline SVG grape cluster + leaf with the brand
// violet gradient. Ported verbatim from fb-shared.jsx BerryMark.
export function BerryMark({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="fbBerry" x1="4" y1="6" x2="26" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A989FF" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <path
        d="M17 3.2c.4 2.4 2.2 4 4.7 4.3-.2 2-1.7 3.3-3.9 3.4"
        stroke="#2BE08C"
        strokeWidth="2.1"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="10.5" cy="14" r="5.1" fill="url(#fbBerry)" />
      <circle cx="20.5" cy="15.5" r="4.6" fill="url(#fbBerry)" />
      <circle cx="15" cy="22.5" r="5.4" fill="url(#fbBerry)" />
      <circle cx="9" cy="12.4" r="1.3" fill="#fff" opacity=".5" />
      <circle cx="19" cy="14" r="1.1" fill="#fff" opacity=".45" />
    </svg>
  );
}

export default BerryMark;
