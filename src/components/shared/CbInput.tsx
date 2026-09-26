import React, { useRef } from 'react';
import { X, Search } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export interface CbInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  onClear?: () => void;
  clearable?: boolean;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
}

/**
 * CbInput
 * Reusable Cardback Input component supporting value propagation, 
 * Enter key trigger, and verified Clear button output event.
 */
export const CbInput: React.FC<CbInputProps> = ({
  id,
  value,
  onChange,
  onEnter,
  onClear,
  clearable = false,
  placeholder = 'Search...',
  type = 'text',
  disabled = false,
  autoFocus = false,
  className = '',
  icon,
  size = 'md',
  ariaLabel
}) => {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnter?.();
    } else if (e.key === 'Escape' && clearable && value) {
      e.preventDefault();
      handleClear();
    }
  };

  const handleClear = () => {
    onChange('');
    onClear?.();
    // Return focus to input for fluid collector typing
    inputRef.current?.focus();
  };

  const sizeClasses = {
    sm: 'h-8 text-xs px-3',
    md: 'h-10 text-sm px-3.5',
    lg: 'h-12 text-base px-4'
  }[size];

  const hasLeadingIcon = Boolean(icon);
  const showClearButton = clearable && Boolean(value && value.length > 0) && !disabled;

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      {hasLeadingIcon && (
        <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          {icon}
        </div>
      )}

      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label={ariaLabel || placeholder}
        className={`w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 
          text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500
          focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 dark:focus:border-amber-400
          transition-all duration-150 shadow-xs
          ${sizeClasses}
          ${hasLeadingIcon ? 'pl-10' : ''}
          ${showClearButton ? 'pr-10' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''}`}
      />

      {showClearButton && (
        <button
          type="button"
          id={id ? `${id}-clear-btn` : 'cb-input-clear-btn'}
          onClick={handleClear}
          title={t('search.clear', 'Clear search')}
          aria-label={t('search.clear', 'Clear search')}
          className="absolute right-2.5 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300
            hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
