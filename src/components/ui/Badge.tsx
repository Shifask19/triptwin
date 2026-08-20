import clsx from 'clsx';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'gray' | 'orange';
  size?: 'sm' | 'md';
  className?: string;
}

const variantClasses = {
  green:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  red:    'bg-red-500/15 text-red-400 border-red-500/25',
  yellow: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  blue:   'bg-blue-500/15 text-blue-400 border-blue-500/25',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  gray:   'bg-white/8 text-[#8888A4] border-white/10',
  orange: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
};

export function Badge({ children, variant = 'gray', size = 'sm', className }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 rounded-full border font-medium',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  );
}
