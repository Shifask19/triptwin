import clsx from 'clsx';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'emerald' | 'blue' | 'amber' | 'red' | 'purple' | 'indigo';
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const colorClasses = {
  emerald: 'bg-emerald-500',
  blue:    'bg-blue-500',
  amber:   'bg-amber-500',
  red:     'bg-red-500',
  purple:  'bg-purple-500',
  indigo:  'bg-indigo-500',
};

const sizeClasses = { xs: 'h-1', sm: 'h-1.5', md: 'h-2' };

export function ProgressBar({ value, max = 100, color = 'purple', size = 'sm', showLabel = false, label, className }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={clsx('w-full', className)}>
      {(showLabel || label) && (
        <div className="mb-1 flex justify-between text-xs text-[#8888A4]">
          {label && <span>{label}</span>}
          {showLabel && <span>{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={clsx('progress-track w-full', sizeClasses[size])}>
        <div
          className={clsx('progress-fill', colorClasses[color], sizeClasses[size])}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
