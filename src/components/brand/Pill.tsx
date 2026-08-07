import * as React from 'react';
import { cn } from '@/lib/utils';

// Small rounded status pill in six tones. Ported from fb-shared.jsx Pill.
// Mono, 12.5px/600. Tones carry a soft tinted background + saturated text.
export type PillTone = 'up' | 'dn' | 'violet' | 'gold' | 'pink' | 'mute';

const TONES: Record<PillTone, string> = {
  up: 'text-up bg-up-soft',
  dn: 'text-down bg-down-soft',
  violet: 'text-violet bg-violet-soft',
  gold: 'text-gold bg-[rgba(181,126,11,0.12)]',
  pink: 'text-pink bg-[rgba(214,45,142,0.10)]',
  mute: 'text-ink-2 bg-[rgba(30,16,48,0.06)]',
};

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: PillTone;
}

export function Pill({ tone = 'up', className, children, ...props }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill px-[9px] py-[3px] font-mono text-[12.5px] font-semibold whitespace-nowrap',
        TONES[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Pill;
