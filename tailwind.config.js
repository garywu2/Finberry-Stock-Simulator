import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
// Berry Bright design tokens. See docs/redesign/design-system.md for the full
// reference. Semantic shadcn CSS-variable colors are wired in Phase 1 alongside
// the first shadcn components; this config exposes the brand tokens as utilities.
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#F5F1FB', 2: '#EEE8F7' },
        surface: { DEFAULT: '#FFFFFF', 2: '#F3EFFB', 3: '#E9E1F5' },
        line: { DEFAULT: '#ECE5F5', 2: '#DCD3EC' },
        ink: { DEFAULT: '#1E1630', 2: '#5F5577', 3: '#938AA8' },
        violet: { DEFAULT: '#7C3AED', soft: 'rgba(124,58,237,0.10)' },
        up: { DEFAULT: '#0A9A52', btn: '#16C078', soft: 'rgba(10,154,82,0.12)' },
        down: { DEFAULT: '#DA2F4D', soft: 'rgba(218,47,77,0.10)' },
        gold: '#B57E0B',
        pink: '#D62D8E',
        accent: '#2BE08C',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        sans: ['"Hanken Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '18px',
        field: '12px',
        btn: '11px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(30,16,48,0.04), 0 10px 26px -18px rgba(30,16,48,0.16)',
        btn: '0 4px 18px -6px rgba(124,58,237,0.7)',
        buy: '0 8px 20px -8px rgba(22,192,120,0.6)',
      },
    },
  },
  // Preflight is disabled while MUI and Tailwind coexist so Tailwind's global
  // reset doesn't disturb the existing MUI-styled pages. Re-enable (scoped) once
  // MUI is fully removed.
  corePlugins: {
    preflight: false,
  },
  plugins: [animate],
};
