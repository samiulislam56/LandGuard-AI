import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-cadastral-ink/80 dark:text-cadastral-paper/80 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-cadastral-ink/40 dark:text-cadastral-paper/40 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-md border text-sm transition-all duration-150 bg-white dark:bg-cadastral-deep text-cadastral-ink dark:text-cadastral-paper placeholder:text-cadastral-ink/40 dark:placeholder:text-cadastral-paper/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cadastral-teal min-h-[38px] ${
              leftIcon ? 'pl-9' : 'pl-3.5'
            } ${rightIcon ? 'pr-9' : 'pr-3.5'} py-2 ${
              error
                ? 'border-red-500 focus-visible:ring-red-500'
                : 'border-cadastral-borderLight dark:border-cadastral-borderDark hover:border-cadastral-teal/60'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-cadastral-ink/40 dark:text-cadastral-paper/40">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-cadastral-ink/60 dark:text-cadastral-paper/60">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
