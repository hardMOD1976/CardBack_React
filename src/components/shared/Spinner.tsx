import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = ''
}) => {
  const { t } = useLanguage();
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3'
  }[size];

  return (
    <div
      className={`inline-block border-slate-300 dark:border-slate-700 border-t-amber-500 rounded-full animate-spin ${sizeClasses} ${className}`}
      role="status"
      aria-label={t('ai.validating', 'Loading')}
    />
  );
};
