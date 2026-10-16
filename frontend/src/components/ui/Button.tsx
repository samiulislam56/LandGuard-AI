import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'px-2.5 py-1.5 text-xs gap-1.5',
      md: 'px-3.5 py-2 text-sm gap-2',
      lg: 'px-4 py-2.5 text-base gap-2.5',
    }[size];

    const variantClasses = {
      primary:
        'bg-atlas-cyan hover:bg-atlas-cyan/85 text-slate-950 font-bold shadow-atlas-sm rounded-xl focus-visible:ring-2 focus-visible:ring-atlas-cyan',
      secondary:
        'bg-atlas-elevated hover:bg-atlas-panel text-atlas-textPrimary font-semibold border border-atlas-border rounded-xl',
      outline:
        'border border-atlas-border hover:border-atlas-cyan/60 text-atlas-textPrimary hover:bg-black/5 dark:hover:bg-white/5 font-semibold rounded-xl',
      ghost:
        'text-atlas-textPrimary hover:bg-black/5 dark:hover:bg-white/5 font-semibold rounded-xl',
      danger:
        'bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl focus-visible:ring-2 focus-visible:ring-red-500',
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none min-h-[38px] ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
