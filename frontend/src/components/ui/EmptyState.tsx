import React from 'react';
import { Database, SearchX } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: 'search' | 'database';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'Try adjusting your search criteria, clearing active filters, or inspecting another cadastral plot.',
  icon = 'search',
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center max-w-md mx-auto">
      <div className="w-12 h-12 rounded-full bg-cadastral-subtleLight dark:bg-cadastral-subtleDark flex items-center justify-center text-cadastral-teal mb-4">
        {icon === 'search' ? (
          <SearchX className="w-6 h-6" aria-hidden="true" />
        ) : (
          <Database className="w-6 h-6" aria-hidden="true" />
        )}
      </div>
      <h4 className="text-base font-semibold text-cadastral-ink dark:text-cadastral-paper mb-1">
        {title}
      </h4>
      <p className="text-sm text-cadastral-ink/70 dark:text-cadastral-paper/70 mb-5">
        {description}
      </p>
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

export { ErrorState } from './ErrorState';
export type { ErrorStateProps } from './ErrorState';

