import React from 'react';

export type BadgeVariant =
  | 'review'
  | 'insufficient'
  | 'clean'
  | 'pending'
  | 'anomaly'
  | 'normal'
  | 'info'
  | 'neutral'
  | 'danger'
  | 'warning'
  | 'success'
  | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs tracking-wide';

  const baseReview = 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 font-semibold';
  const baseInsufficient = 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-semibold';
  const baseClean = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-semibold';
  const baseNeutral = 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border border-gray-500/20';

  const variantClasses: Record<BadgeVariant, string> = {
    review: baseReview,
    danger: baseReview,
    insufficient: baseInsufficient,
    warning: baseInsufficient,
    clean: baseClean,
    success: baseClean,
    pending: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 font-semibold',
    anomaly: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 font-mono font-medium',
    normal: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 font-mono font-medium',
    info: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20',
    neutral: baseNeutral,
    default: baseNeutral,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses} ${variantClasses[variant]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      {children}
    </span>
  );
};

export const getStatusBadgeVariant = (status: string): BadgeVariant => {
  switch (status) {
    case 'REVIEW_REQUIRED':
      return 'review';
    case 'INSUFFICIENT_EVIDENCE':
      return 'insufficient';
    case 'PENDING_DATE_VERIFICATION':
      return 'pending';
    case 'NO_REVIEW_FLAG_DETECTED':
      return 'clean';
    case 'ANOMALY':
      return 'anomaly';
    case 'NORMAL_PATTERN':
      return 'normal';
    default:
      return 'neutral';
  }
};
