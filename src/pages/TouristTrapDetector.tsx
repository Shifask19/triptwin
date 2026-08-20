import { Shield, AlertTriangle, CheckCircle, Star, Users } from 'lucide-react';
import { useTripStore } from '../store/useTripStore';
import { Badge } from '../components/ui/Badge';
import { ScoreRing } from '../components/ui/ScoreRing';
import { ProgressBar } from '../components/ui/ProgressBar';
import type { TrapComparison } from '../types';

function TrapMeter({ score }: { score: number }) {
  const color = score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#10b981';
  const label = score >= 70 ? 'Tourist Trap' : score >= 40 ? 'Fair Value' : 'Great Value';
  const barColor = score >= 70 ? 'red' : score >= 40 ? 'amber' : 'emerald';
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#8888A4]">Tourist Trap Score</span>
        <span className="text-sm font-bold" style={{ color }}>{score}/100 — {label}</span>
      </div>
      <ProgressBar value={score} color={barColor} size="md" />
    </div>
  );
}

const comparisonConfig: Record<string, { emoji: string; border: string; bg: string; badge: 'blue'|'green'|'purple'|'orange' }> = {
  'Most Iconic':   { emoji: '🏛️', border: 'rgba(59,130,246,0.25)',   bg: 'rgba(59,130,246,0.06)',   badge: 'blue'   },
  'Best Value':    { emoji: '💚', border: 'rgba(16,185,129,0.25)',   bg: 'rgba(16,185,129,0.06)',   badge: 'green'  },
  'Least Crowded': { emoji: '🕊️', border: 'rgba(168,85,247,0.25)',  bg: 'rgba(168,85,247,0.06)',  badge: 'purple' },
  'Hidden Gem':    { emoji: '💎', border: 'rgba(245,158,11,0.25)',   bg: 'rgba(245,158,11,0.06)',   badge: 'orange' },
};

function ComparisonCard({ item }: { item: TrapComparison }) {
  const cfg = comparisonConfig[item.label] ?? { emoji: '📍', border: 'rgba(255,255,255,0.1)', bg: 'rgba(255,255,255,0.03)', badge: 'gray' as const };
  const crowdColor = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' }[item.crowdLevel];
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${cfg.border}`, background: cfg.bg }}>
      <img src={item.image} alt={item.name} className="w-full h-28 object-cover" />
      <div className="p-3 space-y-2">
        <Badge variant={cfg.badge as 'blue'|'green'|'purple'|'orange'} size="sm">{cfg.emoji} {item.label}</Badge>
        <p className="font-semibold text-[#E8E8F0] text-sm leading-snug">{item.name}</p>
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#E8E8F0]">{item.cost === 0 ? 'Free' : `$${item.cost}`}</span>
          <span className="flex items-center gap-0.5 text-amber-400">
            <Star className="h-3 w-3 fill-current" />{item.rating}
          </span>
          <span className="flex items-center gap-1 font-medium" style={{ color: crowdColor }}>
            <Users className="h-3 w-3" />{item.crowdLevel}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#6B6B88]">Your match</span>
          <span className="text-xs font-bold" style={{ color: item.personalMatch >= 80 ? '#10b981' : item.personalMatch >= 60 ? '#f59e0b' : '#ef4444' }}>
            {item.personalMatch}%
          </span>
        </div>
      </div>
    </div>
  );
}

export function TouristTrapDetector() {
  const { trapData, trip } = useTripStore();
  const activityMap = Object.fromEntries(
    trip.itinerary.flatMap(d => d.activities).map(a => [a.id, a])
  );

  return (
    <div className="space-y-6 fade-up">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
          style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)' }}>
          <Shield className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Tourist Trap Detector</h1>
          <p className="text-sm text-[#8888A4] mt-0.5">Analyses whether an experience provides real value for <em>you</em> — not whether it's popular.</p>
        </div>
      </div>

      {/* Philosophy */}
      <div className="flex gap-3 rounded-2xl p-4"
        style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-300 text-sm">What this score means</p>
          <p className="text-xs text-amber-400/70 leading-relaxed mt-1">
            A high trap score doesn't mean the attraction is bad. It means given <strong>your</strong> budget,
            crowd tolerance, and travel style — there are better-value alternatives nearby.
          </p>
        </div>
      </div>

      {/* Analyses */}
      {trapData.map(analysis => {
        const act = activityMap[analysis.activityId];
        if (!act) return null;
        return (
          <div key={analysis.activityId} className="rounded-2xl overflow-hidden glass">
            {/* Activity hero */}
            <div className="relative">
              <img src={act.image} alt={act.name} className="h-40 w-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.8) 0%,transparent 50%)' }} />
              <div className="absolute bottom-0 left-0 p-4 flex items-end justify-between w-full">
                <div className="text-white">
                  <p className="font-bold text-lg">{act.name}</p>
                  <p className="text-sm opacity-70">{act.location}</p>
                </div>
                <ScoreRing score={analysis.score} size="md" colorByScore={false} />
              </div>
            </div>

            <div className="p-5 space-y-5">
              <TrapMeter score={analysis.score} />

              {/* Verdict */}
              <div className="flex items-start gap-3 rounded-xl p-3"
                style={{
                  background: analysis.verdict === 'tourist-trap' ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.06)',
                  border: `1px solid ${analysis.verdict === 'tourist-trap' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
                }}>
                {analysis.verdict === 'tourist-trap'
                  ? <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                  : <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />}
                <div className="space-y-1">
                  {analysis.warnings.map((w, i) => (
                    <p key={i} className="text-sm text-[#C0C0D8]">{w}</p>
                  ))}
                </div>
              </div>

              {/* Comparison grid */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#6B6B88] mb-3">Compare your options</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {analysis.comparisons.map(comp => (
                    <ComparisonCard key={comp.label} item={comp} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {trapData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center glass rounded-2xl space-y-3">
          <Shield className="h-10 w-10 text-[#4B4B60]" />
          <p className="font-semibold text-[#8888A4]">No activities to analyse yet</p>
          <p className="text-sm text-[#6B6B88]">Add activities to your itinerary to see trap analysis.</p>
        </div>
      )}
    </div>
  );
}
