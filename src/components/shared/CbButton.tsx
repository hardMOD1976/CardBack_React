import React from 'react';

export interface CbButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const CbButton: React.FC<CbButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 select-none focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[34px]',
    md: 'text-sm px-4 py-2 gap-2 min-h-[40px]',
    lg: 'text-base px-5 py-2.5 gap-2.5 min-h-[46px]'
  }[size];

  const variantClasses = {
    // Primary is the unified signature Amber button for key calls-to-action
    primary: 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold focus:ring-amber-500 shadow-sm border border-amber-400/30',
    // Amber alias identical to primary for backward compatibility
    amber: 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold focus:ring-amber-500 shadow-sm border border-amber-400/30',
    // Secondary subtle slate surface
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/80 focus:ring-slate-400 shadow-xs',
    // Outline hairline border
    outline: 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 hover:border-slate-400 dark:hover:border-slate-600 focus:ring-slate-400 shadow-xs',
    // Ghost quiet button
    ghost: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 focus:ring-slate-400',
    // Danger for destructive actions
    danger: 'bg-rose-600 text-white hover:bg-rose-500 focus:ring-rose-500 shadow-xs border border-rose-500/30'
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};
