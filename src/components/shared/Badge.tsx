import React from 'react';
import { EntityType, FigureCondition } from '../../types/domain';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: EntityType | FigureCondition | 'default' | 'amber' | 'emerald' | 'rose' | 'purple' | 'blue' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-0.75';

  const variantMap: Record<string, string> = {
    // Entities
    franchise: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
    manufacturer: 'bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border-indigo-500/30',
    line: 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30',
    character: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30',
    figure: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
    variant: 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30',
    product_release: 'bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-500/30',
    
    // Conditions
    MOC: 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 font-semibold',
    LOOSE_COMPLETE: 'bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-500/40 font-semibold',
    LOOSE_INCOMPLETE: 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40 font-semibold',
    GRADED: 'bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-500/40 font-bold',
    CUSTOM: 'bg-pink-500/20 text-pink-800 dark:text-pink-300 border-pink-500/40',

    // Fallbacks
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300/60 dark:border-slate-700',
    amber: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
    rose: 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30',
    purple: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30',
    blue: 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30',
    gray: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
  };

  const styleClass = variantMap[variant] || variantMap.default;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border tracking-wide whitespace-nowrap select-none ${sizeClasses} ${styleClass} ${className}`}
    >
      {children}
    </span>
  );
};
