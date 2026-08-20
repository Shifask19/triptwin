import { Shield, AlertTriangle, CheckCircle, Star, Users } from 'lucide-react';
import { useTripStore } from '../store/useTripStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ScoreRing } from '../components/ui/ScoreRing';
import { ProgressBar } from '../components/ui/ProgressBar';
import type { TrapComparison } from '../types';

function TrapMeter({ score }: { score: number }) {
  const color = score >= 70 ? 'text-red-600' : score >= 40 ? 'text-amber-600' : 'text-emerald-600';
  const label = score >= 70 ? 'Tourist Trap' : score >= 40 ? 'Fair Value' : 'Great Value';
  const barColor = score >= 70 ? 'red' : score >= 40 ? 'amber' : 'emerald';
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Tourist Trap Score</span>
        <span className={`text-sm font-bold ${color}`}>{score}/100 — {label}</span>
      </div>
      <ProgressBar value={score} color={barColor} size="md" />
    </div>
  );
}

const comparisonStyles: Record<string, { bg: string; badge: string; badgeVariant: 'blue' | 'green' | 'purple' | 'orange' }> = {
  'Most Iconic':   { bg: 'bg-blue-50 border-blue-200',   badge: '🏛️ Most Iconic',   badgeVariant: 'blue' },
  'Best Value':    { bg: 'bg-emerald-50 border-emerald-200', badge: '💚 Best Value', badgeVariant: 'green' },
  'Least Crowded': { bg: 'bg-purple-50 border-purple-200', badge: '🕊️ Least Crowded', badgeVariant: 'purple' },
  'Hidden Gem':    { bg: 'bg-orange-50 border-orange-200', badge: '💎 Hidden Gem',  badgeVariant: 'orange' },
};

function ComparisonCard({ item }: { item: TrapComparison }) {
  const style = comparisonStyles[item.label] ?? { bg: 'bg-gray-50 border-gray-200', badge: item.label, badgeVariant: 'gray' as const };
  const crowdColor = { low: 'text-emerald-600', medium: 'text-amber-600', high: 'text-red-600' }[item.crowdLevel];

  return (
    <div className={`rounded-2xl border p-3 space-y-2 ${style.bg}`}>
      <img src={item.image} alt={item.name} className="w-full h-28 object-cover rounded-xl" />
      <Badge variant={style.badgeVariant as any} size="sm">{style.badge}</Badge>
      <p className="font-semibold text-gray-900 text-sm leading-snug">{item.name}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-gray-800">{item.cost === 0 ? 'Free' : `$${item.cost}`}</span>
        <span className="flex items-center gap-0.5 text-amber-500">
          <Star className="h-3 w-3 fill-current" />{item.rating}
        </span>
        <span className={`flex items-center gap-0.5 font-medium ${crowdColor}`}>
          <Users className="h-3 w-3" />{item.crowdLevel}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Your match</span>
        <span className={`text-xs font-bold ${item.personalMatch >= 80 ? 'text-emerald-600' : item.personalMatch >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
          {item.personalMatch}%
        </span>
      </div>
    </div>
  );
}

export function TouristTrapDetector() {
  const { trapData, trip } = useTripStore();

  // Map trap data to activity names
  const activityMap = Object.fromEntries(
    trip.itinerary.flatMap(d => d.activities).map(a => [a.id, a])
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-200">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tourist Trap Detector</h1>
          <p className="text-sm text-gray-500 mt-0.5 max-w-xl">
            Analyses whether an experience provides real value <em>for you</em> — not whether it's popular.
            Popular ≠ right for your budget, style, and preferences.
          </p>
        </div>
      </div>

      {/* Philosophy note */}
      <Card className="bg-amber-50 border-amber-200">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800">What this score means</p>
            <p className="text-sm text-amber-700 leading-relaxed mt-1">
              A high tourist trap score doesn't mean the attraction is bad. It means that given <strong>your</strong> budget,
              crowd tolerance, and travel style, there are better-value alternatives nearby. The goal is to help you
              spend your time and money intelligently.
            </p>
          </div>
        </div>
      </Card>

      {/* Analyses */}
      {trapData.map(analysis => {
        const act = activityMap[analysis.activityId];
        if (!act) return null;

        return (
          <Card key={analysis.activityId} padding="none" className="overflow-hidden">
            {/* Activity header */}
            <div className="relative">
              <img src={act.image} alt={act.name} className="h-40 w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 text-white">
                <p className="font-bold text-lg">{act.name}</p>
                <p className="text-sm opacity-80">{act.location}</p>
              </div>
              <div className="absolute top-3 right-3">
                <ScoreRing
                  score={analysis.score}
                  size="md"
                  colorByScore={false}
                />
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Trap meter */}
              <TrapMeter score={analysis.score} />

              {/* Verdict */}
              <div className={`flex items-start gap-2 rounded-xl p-3 ${
                analysis.verdict === 'tourist-trap' ? 'bg-red-50 border border-red-200' :
                analysis.verdict === 'fair' ? 'bg-amber-50 border border-amber-200' :
                'bg-emerald-50 border border-emerald-200'
              }`}>
                {analysis.verdict === 'tourist-trap'
                  ? <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  : <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                }
                <div className="space-y-1">
                  {analysis.warnings.map((w, i) => (
                    <p key={i} className="text-sm text-gray-700">{w}</p>
                  ))}
                </div>
              </div>

              {/* Comparison grid */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Your options — compare before you go</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {analysis.comparisons.map(comp => (
                    <ComparisonCard key={comp.label} item={comp} />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        );
      })}

      {trapData.length === 0 && (
        <Card className="text-center py-12 space-y-3 text-gray-400">
          <Shield className="h-10 w-10 mx-auto opacity-30" />
          <p className="font-medium">No activities to analyse yet</p>
          <p className="text-sm">Add activities to your itinerary to see trap analysis.</p>
        </Card>
      )}
    </div>
  );
}
