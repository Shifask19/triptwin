import { useState } from 'react';
import { AlertTriangle, CloudRain, Users, Clock, TrendingDown, CheckCircle, X, ChevronRight, Zap } from 'lucide-react';
import type { TripSwapAlert, ActivitySnapshot } from '../types';
import { Button } from './ui/Button';

function CrowdDot({ level }: { level: 'low' | 'medium' | 'high' }) {
  const colors = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };
  const labels = { low: 'Low', medium: 'Medium', high: 'High' };
  return (
    <span className="flex items-center gap-1 text-xs text-[#8888A4]">
      <span className="h-2 w-2 rounded-full" style={{ background: colors[level] }} />
      {labels[level]}
    </span>
  );
}

function ActivityCard({ snapshot, highlight, label, selected, onClick }: {
  snapshot: ActivitySnapshot; highlight?: 'current'|'better'; label?: string; selected?: boolean; onClick?: () => void;
}) {
  const borderColor = selected ? '#6C47FF'
    : highlight === 'better'  ? '#10b981'
    : highlight === 'current' ? '#ef4444'
    : 'rgba(255,255,255,0.1)';

  const bg = selected ? 'rgba(108,71,255,0.1)'
    : highlight === 'better'  ? 'rgba(16,185,129,0.06)'
    : highlight === 'current' ? 'rgba(239,68,68,0.06)'
    : 'rgba(255,255,255,0.03)';

  const labelBg = highlight === 'better' ? '#10b981' : highlight === 'current' ? '#ef4444' : '#6C47FF';

  return (
    <div onClick={onClick} className="relative overflow-hidden rounded-2xl transition-all" style={{ border: `2px solid ${borderColor}`, background: bg, cursor: onClick ? 'pointer' : 'default' }}>
      {label && (
        <div className="absolute left-0 top-0 px-2.5 py-1 text-xs font-bold text-white z-10" style={{ background: labelBg }}>
          {label}
        </div>
      )}
      <div className="aspect-video w-full overflow-hidden">
        <img src={snapshot.image} alt={snapshot.name} className="h-full w-full object-cover" />
      </div>
      <div className="p-3 space-y-2">
        <p className="font-semibold text-[#E8E8F0] text-sm line-clamp-2">{snapshot.name}</p>
        <p className="text-xs text-[#6B6B88]">{snapshot.type}</p>
        <div className="grid grid-cols-2 gap-y-1.5">
          <span className="text-xs text-[#8888A4] font-medium">{snapshot.cost === 0 ? 'Free' : `$${snapshot.cost}`}</span>
          <CrowdDot level={snapshot.crowdLevel} />
          <span className="flex items-center gap-1 text-xs text-[#6B6B88]">
            <Clock className="h-3 w-3" />{snapshot.travelTime} min
          </span>
          <span className="flex items-center gap-1 text-xs text-[#6B6B88]">
            <span className="h-2 w-2 rounded-full" style={{ background: snapshot.weatherSuitability === 'indoor' ? '#60a5fa' : '#fbbf24' }} />
            {snapshot.weatherSuitability}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-xs text-[#6B6B88]">Match</span>
          <span className="font-bold text-sm" style={{ color: snapshot.personalMatch >= 80 ? '#10b981' : snapshot.personalMatch >= 60 ? '#f59e0b' : '#ef4444' }}>
            {snapshot.personalMatch}%
          </span>
        </div>
      </div>
    </div>
  );
}

export function TripSwapModal({ alert, onAccept, onDismiss }: {
  alert: TripSwapAlert; onAccept: (id: string) => void; onDismiss: () => void;
}) {
  const [selectedOption, setSelectedOption] = useState(alert.betterOption.id);
  const [showAlternatives, setShowAlternatives] = useState(false);

  const signalIcon = (type: string) => {
    if (type === 'weather') return <CloudRain className="h-4 w-4" />;
    if (type === 'crowd')   return <Users className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
        style={{ background: '#0F0F18', border: '1px solid rgba(255,255,255,0.1)' }}>

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
          style={{ background: '#0F0F18', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl btn-brand">
              <Zap className="h-4.5 w-4.5 text-white" style={{ width:18,height:18 }} />
            </div>
            <div>
              <p className="font-bold text-[#E8E8F0]">TripSwap Alert</p>
              <p className="text-xs text-[#6B6B88]">Real-time plan optimisation</p>
            </div>
          </div>
          <button onClick={onDismiss}
            className="rounded-xl p-2 text-[#6B6B88] hover:bg-white/6 hover:text-[#E8E8F0] transition-colors"
            aria-label="Dismiss">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Signals */}
          <div>
            <p className="text-sm font-semibold text-[#C0C0D8] mb-3">{alert.reason}</p>
            <div className="flex flex-wrap gap-2">
              {alert.signals.map((sig, i) => {
                const isCritical = sig.severity === 'critical';
                return (
                  <span key={i} className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium"
                    style={{ background: isCritical ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: isCritical ? '#f87171' : '#fbbf24', border: `1px solid ${isCritical ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                    {signalIcon(sig.type)}{sig.label} — {sig.value}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Current vs Better */}
          <div className="grid grid-cols-2 gap-3">
            <ActivityCard snapshot={alert.currentActivity} highlight="current" label="CURRENT PLAN" />
            <ActivityCard snapshot={alert.betterOption} highlight="better" label="BETTER OPTION"
              selected={selectedOption === alert.betterOption.id}
              onClick={() => setSelectedOption(alert.betterOption.id)} />
          </div>

          {/* Benefits */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <p className="text-xs font-semibold text-emerald-400 mb-2.5 uppercase tracking-wider">Potential Benefits</p>
            <div className="flex flex-wrap gap-4">
              {alert.potentialBenefit.saveMoney > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <TrendingDown className="h-3.5 w-3.5" />Save ${alert.potentialBenefit.saveMoney}
                </span>
              )}
              {alert.potentialBenefit.saveTime > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <Clock className="h-3.5 w-3.5" />Save {alert.potentialBenefit.saveTime} min
                </span>
              )}
              {alert.potentialBenefit.weatherImprovement && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle className="h-3.5 w-3.5" />Avoid rain
                </span>
              )}
              {alert.potentialBenefit.crowdReduction && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <Users className="h-3.5 w-3.5" />Fewer crowds
                </span>
              )}
            </div>
          </div>

          {/* Alternatives toggle */}
          {alert.alternatives.length > 0 && (
            <button onClick={() => setShowAlternatives(v => !v)}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm text-[#8888A4] transition-colors hover:bg-white/4"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <span>More alternatives ({alert.alternatives.length})</span>
              <ChevronRight className={`h-4 w-4 transition-transform ${showAlternatives ? 'rotate-90' : ''}`} />
            </button>
          )}

          {showAlternatives && (
            <div className="grid grid-cols-2 gap-3">
              {alert.alternatives.map(alt => (
                <ActivityCard key={alt.id} snapshot={alt}
                  selected={selectedOption === alt.id}
                  onClick={() => setSelectedOption(alt.id)} />
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1 pb-safe">
            <button onClick={() => onAccept(selectedOption)}
              className="btn-brand flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white">
              <CheckCircle className="h-4 w-4" />Accept Swap
            </button>
            <Button variant="secondary" size="lg" onClick={onDismiss} className="flex-shrink-0">
              Keep Original
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
