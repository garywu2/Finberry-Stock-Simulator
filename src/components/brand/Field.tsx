import * as React from 'react';
import { cn } from '@/lib/utils';

// Labelled text input matching the Berry Bright form pattern (surface-2 fill,
// line-2 border, 12px radius, label above). The mocks repeat this inline rather
// than as a primitive; this is the extracted version.
export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, className, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <label htmlFor={inputId} className="block">
        {label && (
          <span className="mb-1.5 block text-[12.5px] font-semibold text-ink-3">{label}</span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-field border border-line-2 bg-surface-2 px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-violet',
            className
          )}
          {...props}
        />
      </label>
    );
  }
);
Field.displayName = 'Field';

export default Field;
