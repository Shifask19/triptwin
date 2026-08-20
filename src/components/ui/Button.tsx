import clsx from 'clsx';
import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

const variantClasses = {
  primary: 'btn-brand text-white border-transparent',
  secondary: 'bg-white/8 text-[#E8E8F0] hover:bg-white/12 border-white/10',
  ghost: 'bg-transparent text-[#8888A4] hover:bg-white/6 border-transparent',
  danger: 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/20',
  success: 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/20',
};

const sizeClasses = {
  xs: 'px-2.5 py-1 text-xs rounded-lg',
  sm: 'px-3 py-1.5 text-sm rounded-xl',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-2xl font-semibold',
};

export function Button({
  children, variant = 'primary', size = 'md',
  fullWidth = false, loading = false, className, disabled, ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 border font-medium transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:ring-offset-1 focus:ring-offset-transparent disabled:opacity-40 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
    >
      {loading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  );
}
