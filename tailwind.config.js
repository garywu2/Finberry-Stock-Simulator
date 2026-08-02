import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
// Berry Bright design tokens (see docs/redesign/design-system.md).
// Two color layers coexist:
//   1. Brand tokens (bg, surface, line, ink, violet, up, down, gold, pink, mint)
//      — the raw palette, used directly by brand components.
//   2. shadcn semantic tokens (background, foreground, primary, muted, …) bound
//      to CSS variables in src/index.css, so shadcn/ui + dither-kit components
//      inherit the palette.
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand tokens
        bg: { DEFAULT: '#F5F1FB', 2: '#EEE8F7' },
        surface: { DEFAULT: '#FFFFFF', 2: '#F3EFFB', 3: '#E9E1F5' },
        line: { DEFAULT: '#ECE5F5', 2: '#DCD3EC' },
        ink: { DEFAULT: '#1E1630', 2: '#5F5577', 3: '#938AA8' },
        violet: { DEFAULT: '#7C3AED', soft: 'rgba(124,58,237,0.10)' },
        up: { DEFAULT: '#0A9A52', btn: '#16C078', soft: 'rgba(10,154,82,0.12)' },
        down: { DEFAULT: '#DA2F4D', soft: 'rgba(218,47,77,0.10)' },
        gold: '#B57E0B',
        pink: '#D62D8E',
        mint: '#2BE08C',

        // shadcn semantic tokens (CSS-variable driven)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        sans: ['"Hanken Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        // Brand radii
        card: '18px',
        field: '12px',
        btn: '11px',
        pill: '999px',
        // shadcn radii
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
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
