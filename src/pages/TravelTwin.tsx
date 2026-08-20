import { Brain, TrendingUp, MapPin, Star, X, Check } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { useTripStore } from '../store/useTripStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ScoreRing } from '../components/ui/ScoreRing';

function PreferenceBar({ label, value, left, right }: { label: string; value: number; left: string; right: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{left}</span>
        <span className="font-medium text-gray-700">{label}</span>
        <span>{right}</span>
      </div>
      <div className="relative h-2 w-full rounded-full bg-gray-100">
        <div className="absolute h-2 w-2 rounded-full bg-indigo-600 -translate-x-1/2 top-0 transition-all duration-500"
          style={{ left: `${value}%` }} />
        <div className="h-2 rounded-full bg-indigo-100" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function TravelTwin() {
  const { twin } = useTripStore();
  const p = twin.preferences;

  const radarData = [
    { subject: 'Food', A: p.foodInterest },
    { subject: 'Photography', A: p.photographyInterest },
    { subject: 'Adventure', A: p.adventureVsRelax },
    { subject: 'Culture', A: p.museumInterest },
    { subject: 'Shopping', A: p.shoppingInterest },
    { subject: 'Nightlife', A: p.nightlifeInterest },
    { subject: 'Nature', A: p.natureVsCity },
  ];

  const spendAffinity = [
    { label: 'Per activity', value: twin.spendingProfile.avgPerActivity, max: 100 },
    { label: 'Per meal', value: twin.spendingProfile.avgPerMeal, max: 80 },
    { label: 'Daily budget', value: twin.spendingProfile.avgDailyBudget, max: 300 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-indigo-200">
          <Brain className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Travel Twin</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {twin.name}'s digital travel profile — learning across every trip
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="purple">{twin.twinAccuracy}% accuracy</Badge>
            <Badge variant="blue">{twin.tripsCompleted} trips logged</Badge>
            <Badge variant="green">{p.travelStyle} traveler</Badge>
            <Badge variant="gray">{p.pace} pace</Badge>
          </div>
        </div>
        <div className="ml-auto hidden sm:block">
          <ScoreRing score={twin.twinAccuracy} size="lg" label="Twin accuracy" colorByScore={false} />
        </div>
      </div>

      {/* Accuracy note */}
      <Card className="bg-indigo-50 border-indigo-200">
        <div className="flex items-start gap-3">
          <TrendingUp className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-indigo-800">How the Twin learns</p>
            <p className="text-sm text-indigo-700 mt-1 leading-relaxed">
              The Travel Twin learns from your actual behaviour — not just what you say you prefer. If you skip museums
              and spend more time at food markets, it notices and adjusts. Accuracy improves with every trip.
              Current accuracy is <strong>{twin.twinAccuracy}%</strong> based on {twin.tripsCompleted} completed trips.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Radar chart */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Interest Profile</h2>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Radar name="Affinity" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
              <Tooltip formatter={(v: unknown) => [`${v}%`, 'Affinity']} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {/* Preference sliders */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Travel Personality</h2>
          <div className="space-y-4">
            <PreferenceBar label="Spending" value={p.luxuryVsBudget} left="Budget" right="Luxury" />
            <PreferenceBar label="Energy" value={p.adventureVsRelax} left="Relax" right="Adventure" />
            <PreferenceBar label="Setting" value={p.natureVsCity} left="City" right="Nature" />
            <PreferenceBar label="Style" value={p.hiddenGemsVsLandmarks} left="Landmarks" right="Hidden gems" />
            <PreferenceBar label="Walking" value={p.walkingTolerance} left="Low" right="High" />
            <PreferenceBar label="Crowds" value={p.crowdTolerance} left="Avoids" right="Loves" />
          </div>
        </Card>
      </div>

      {/* Interest bars */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">Activity Interests</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: 'Food & Dining', value: p.foodInterest },
            { label: 'Photography', value: p.photographyInterest },
            { label: 'Museums & Culture', value: p.museumInterest },
            { label: 'Shopping', value: p.shoppingInterest },
            { label: 'Nightlife', value: p.nightlifeInterest },
            { label: 'Nature & Outdoors', value: p.natureVsCity },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">{label}</span>
                <span className="font-medium text-gray-900">{value}%</span>
              </div>
              <ProgressBar
                value={value}
                color={value >= 80 ? 'emerald' : value >= 50 ? 'indigo' : 'amber'}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Spending profile */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">Spending Profile</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {spendAffinity.map(({ label, value, max }) => (
            <div key={label} className="text-center">
              <ScoreRing
                score={Math.round((value / max) * 100)}
                size="md"
                colorByScore={false}
              />
              <p className="mt-2 font-semibold text-gray-900">${value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Travel memories */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-indigo-600" />
          Past Travel Memories
        </h2>
        <div className="space-y-4">
          {twin.travelMemories.map(mem => (
            <div key={mem.tripId} className="rounded-xl border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{mem.destination}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{mem.dates.start} – {mem.dates.end}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-amber-400 fill-current" />
                  <span className="text-sm font-semibold text-gray-700">{mem.satisfactionScore}/100</span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-emerald-600 mb-1 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Loved
                  </p>
                  <ul className="space-y-0.5">
                    {mem.highlights.map(h => <li key={h} className="text-xs text-gray-600">· {h}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-red-500 mb-1 flex items-center gap-1">
                    <X className="h-3 w-3" /> Skipped
                  </p>
                  <ul className="space-y-0.5">
                    {mem.skipped.map(s => <li key={s} className="text-xs text-gray-600">· {s}</li>)}
                  </ul>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>Budget: ${mem.budgetedSpend} → Spent: ${mem.totalSpend}</span>
                <span>{mem.photos} photos</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
