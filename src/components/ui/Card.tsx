import clsx from 'clsx';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  glow?: boolean;
}

export function Card({ children, className, hover = false, padding = 'md', onClick, glow }: CardProps) {
  const padClasses = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' };
  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-2xl glass',
        padClasses[padding],
        hover && 'glass-hover cursor-pointer',
        onClick && 'cursor-pointer',
        glow && 'ring-1 ring-purple-500/20',
        className
      )}
    >
      {children}
    </div>
  );
}
