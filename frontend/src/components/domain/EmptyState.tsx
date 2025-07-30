import React from 'react';
import { Button } from '../base';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  const defaultIcon = (
    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.007-5.691-2.457M15 15.803c.192-.154.363-.325.515-.515" />
    </svg>
  );

  return (
    <div className={`text-center py-16 ${className}`}>
      <div className="text-gray-400 mb-4">
        {icon || defaultIcon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-4 max-w-md mx-auto">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="outline" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};