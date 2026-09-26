import React from 'react';

export interface CbCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  cardbackStyle?: boolean;
  elevation?: 'flat' | 'subtle' | 'elevated';
  className?: string;
  onClick?: () => void;
}

export const CbCard: React.FC<CbCardProps> = ({
  children,
  interactive = false,
  cardbackStyle = false,
  elevation = 'subtle',
  className = '',
  onClick,
  ...props
}) => {
  const elevationClasses = {
    flat: 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900',
    subtle: 'border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs',
    elevated: 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md'
  }[elevation];

  const interactiveClasses = interactive
    ? 'cursor-pointer hover:border-amber-500/50 dark:hover:border-amber-400/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200'
    : '';

  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl overflow-hidden ${elevationClasses} ${interactiveClasses} ${className}`}
      {...props}
    >
      {cardbackStyle && (
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-8 h-2.5 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950/80 pointer-events-none z-10 flex items-center justify-center">
          <div className="w-4 h-1 rounded-full bg-slate-300 dark:bg-slate-800" />
        </div>
      )}
      {children}
    </div>
  );
};
