import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'API Connection Error',
  message = 'Unable to reach the LandGuard AI FastAPI backend. Please confirm the backend is running.',
  onRetry,
}) => {
  return (
    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6 text-center max-w-lg mx-auto my-6">
      <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
        <AlertTriangle className="w-6 h-6" aria-hidden="true" />
      </div>
      <h4 className="text-base font-semibold text-red-700 dark:text-red-400 mb-1">
        {title}
      </h4>
      <p className="text-sm text-cadastral-ink/80 dark:text-cadastral-paper/80 mb-4 font-mono text-xs break-words">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Retry Request
        </Button>
      )}
    </div>
  );
};
