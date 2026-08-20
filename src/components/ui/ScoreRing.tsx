import clsx from 'clsx';

interface ScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  colorByScore?: boolean;
  className?: string;
}

export function ScoreRing({ score, size = 'md', label, colorByScore = true, className }: ScoreRingProps) {
  const sizes       = { sm: 44, md: 60, lg: 76 };
  const strokeWidths= { sm: 3.5, md: 4.5, lg: 5.5 };
  const fontSizes   = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };
  const glowClass   = { sm: '', md: 'ring-glow-purple', lg: 'ring-glow-purple' };

  const dim  = sizes[size];
  const sw   = strokeWidths[size];
  const r    = (dim - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  const color = !colorByScore
    ? '#6C47FF'
    : score >= 80 ? '#10b981'
    : score >= 60 ? '#f59e0b'
    : '#ef4444';

  const trackColor = !colorByScore ? 'rgba(108,71,255,0.15)' : 'rgba(255,255,255,0.06)';

  return (
    <div className={clsx('flex flex-col items-center gap-1', className)}>
      <div className={clsx('relative', glowClass[size])} style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle cx={dim/2} cy={dim/2} r={r} fill="none" stroke={trackColor} strokeWidth={sw} />
          <circle
            cx={dim/2} cy={dim/2} r={r}
            fill="none" stroke={color} strokeWidth={sw}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={clsx('font-bold', fontSizes[size])} style={{ color }}>
            {score}
          </span>
        </div>
      </div>
      {label && <span className="text-center text-xs text-[#8888A4]">{label}</span>}
    </div>
  );
}
