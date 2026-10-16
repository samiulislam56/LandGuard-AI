import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'accent';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  ...props
}) => {
  const variantClasses = {
    default:
      'bg-atlas-surface border border-atlas-border text-atlas-textPrimary shadow-atlas-sm rounded-2xl',
    subtle:
      'bg-atlas-elevated border border-atlas-border text-atlas-textPrimary rounded-2xl',
    accent:
      'bg-atlas-surface border-l-4 border-l-atlas-cyan border-y border-r border-atlas-border text-atlas-textPrimary shadow-atlas-sm rounded-2xl',
  }[variant];

  return (
    <div
      className={`transition-colors duration-150 ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div
    className={`px-4 sm:px-5 py-3.5 border-b border-atlas-border flex items-center justify-between gap-2 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <h3
    className={`font-bold text-atlas-textPrimary text-sm sm:text-base tracking-tight ${className}`}
    {...props}
  >
    {children}
  </h3>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`p-4 sm:p-5 ${className}`} {...props}>
    {children}
  </div>
);
