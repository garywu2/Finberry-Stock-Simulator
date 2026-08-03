import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Berry Bright buttons. `primary` = violet gradient, `ghost` = subtle surface,
// `buy` = the green trade-action button. Ported from fb-shared.jsx btnPrimary/
// btnGhost plus the Buy variant used on the Simulator/Stock order tickets.
export const buttonVariants = cva(
  // border-0 is explicit because Tailwind Preflight is disabled while MUI
  // coexists, so buttons would otherwise keep the user-agent border.
  'inline-flex items-center justify-center gap-2 rounded-btn border-0 font-sans font-semibold cursor-pointer transition-[filter,background-color] disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary:
          'text-white shadow-btn bg-[linear-gradient(135deg,#9B6BFF,#7C3AED)] hover:brightness-105',
        ghost: 'bg-surface-2 text-ink border border-line-2 hover:bg-surface-3',
        buy: 'bg-up-btn text-[#063521] font-bold shadow-buy hover:brightness-105',
        sell: 'bg-down text-white font-bold hover:brightness-105',
      },
      size: {
        default: 'px-[18px] py-[9px] text-[14.5px]',
        sm: 'px-3 py-1.5 text-[13px]',
        lg: 'px-6 py-3 text-[15px]',
        block: 'w-full px-[18px] py-3 text-[15px]',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = 'Button';
