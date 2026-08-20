import { Brain, TrendingUp, MapPin, Star, X, Check } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { useTripStore } from '../store/useTripStore';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ScoreRing } from '../components/ui/ScoreRing';

function PreferenceBar({ label, value, left, right }: {
  label: string; value: number; left: string; right: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-[#8888A4]">
        <span>{left}</span>
        <span className="font-medium text-[#C0C0D8]">{label}</span>
        <span>{right}</span>
      </div>
      <div className="relative h-1.5 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="absolute h-1.5 rounded-full" style={{ width: `${value}%`, background: 'linear-gradient(90deg,#6C47FF,#A78BFA)' }} />
        <div className="absolute h-3.5 w-3.5 rounded-full border-2 border-[#6C47FF] bg-[#0F0F18] -translate-y-1/2 top-1/2 -translate-x-1/2 transition-all duration-500"
          style={{ left: `${value}%` }} />
      </div>
    </div>
  );
}

const tooltipStyle = { background: '#1E1E2A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#E8E8F0', fontSize: 12 };

export function TravelTwin() {
  const { twin } = useTripStore();
  const p = twin.preferences;

  const radarData = [
    { subject: 'Food',         A: p.foodInterest },
    { subject: 'Photography',  A: p.photographyInterest },
    { subject: 'Adventure',    A: p.adventureVsRelax },
    { subject: 'Culture',      A: p.museumInterest },
    { subject: 'Shopping',     A: p.shoppingInterest },
    { subject: 'Nightlife',    A: p.nightlifeInterest },
    { subject: 'Nature',       A: p.natureVsCity },
  ];

  return (
    <div className="space-y-6 fade-up">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl"
          style={{ background: 'linear-gradient(135deg,#7C5CFF,#A78BFA)' }}>
          <Brain className="h-8 w-8 text-white" />
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: '#10b981' }}>{twin.twinAccuracy}%</div>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">Travel Twin</h1>
          <p className="text-sm text-[#8888A4] mt-0.5">{twin.name} · digital travel profile · learns from every trip</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="purple">{twin.twinAccuracy}% accuracy</Badge>
            <Badge variant="blue">{twin.tripsCompleted} trips logged</Badge>
            <Badge variant="green">{p.travelStyle} traveler</Badge>
            <Badge variant="gray">{p.pace} pace</Badge>
          </div>
        </div>
        <ScoreRing score={twin.twinAccuracy} size="lg" label="Twin accuracy" colorByScore={false} className="hidden sm:flex" />
      </div>

      {/* Learning notice */}
      <div className="flex gap-3 rounded-2xl p-4"
        style={{ background: 'rgba(108,71,255,0.08)', border: '1px solid rgba(108,71,255,0.2)' }}>
        <TrendingUp className="h-5 w-5 text-[#A78BFA] flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-[#C4B5FD] text-sm">How the Twin learns</p>
          <p className="text-xs text-[#8888A4] leading-relaxed mt-1">
            Learns from actual behaviour — not questionnaires. Skip museums and linger at food markets?
            It notices. Accuracy improves with every trip. Currently <strong className="text-[#A78BFA]">{twin.twinAccuracy}%</strong> across {twin.tripsCompleted} trips.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Radar */}
        <div className="rounded-2xl p-5 glass">
          <h2 className="font-semibold text-[#E8E8F0] mb-4">Interest Profile</h2>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#8888A4' }} />
              <Radar name="Affinity" dataKey="A" stroke="#6C47FF" fill="#6C47FF" fillOpacity={0.2} strokeWidth={2} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [`${v}%`, 'Affinity']} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Preference sliders */}
        <div className="rounded-2xl p-5 glass">
          <h2 className="font-semibold text-[#E8E8F0] mb-5">Travel Personality</h2>
          <div className="space-y-5">
            <PreferenceBar label="Spending"  value={p.luxuryVsBudget}        left="Budget"    right="Luxury"      />
            <PreferenceBar label="Energy"    value={p.adventureVsRelax}      left="Relax"     right="Adventure"   />
            <PreferenceBar label="Setting"   value={p.natureVsCity}          left="City"      right="Nature"      />
            <PreferenceBar label="Style"     value={p.hiddenGemsVsLandmarks} left="Landmarks" right="Hidden gems" />
            <PreferenceBar label="Walking"   value={p.walkingTolerance}      left="Low"       right="High"        />
            <PreferenceBar label="Crowds"    value={p.crowdTolerance}        left="Avoids"    right="Loves"       />
          </div>
        </div>
      </div>

      {/* Interest bars */}
      <div className="rounded-2xl p-5 glass">
        <h2 className="font-semibold text-[#E8E8F0] mb-4">Activity Interests</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: 'Food & Dining',      value: p.foodInterest          },
            { label: 'Photography',        value: p.photographyInterest   },
            { label: 'Museums & Culture',  value: p.museumInterest        },
            { label: 'Shopping',           value: p.shoppingInterest      },
            { label: 'Nightlife',          value: p.nightlifeInterest     },
            { label: 'Nature & Outdoors',  value: p.natureVsCity          },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-[#C0C0D8]">{label}</span>
                <span className="font-bold text-[#A78BFA]">{value}%</span>
              </div>
              <ProgressBar value={value} color={value >= 80 ? 'purple' : value >= 50 ? 'indigo' : 'blue'} />
            </div>
          ))}
        </div>
      </div>

      {/* Spending profile */}
      <div className="rounded-2xl p-5 glass">
        <h2 className="font-semibold text-[#E8E8F0] mb-4">Spending Profile</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Per activity', value: `$${twin.spendingProfile.avgPerActivity}` },
            { label: 'Per meal',     value: `$${twin.spendingProfile.avgPerMeal}`     },
            { label: 'Daily budget', value: `$${twin.spendingProfile.avgDailyBudget}` },
          ].map(({ label, value }) => (
            <div key={label} className="text-center rounded-xl py-4" style={{ background: 'rgba(108,71,255,0.08)' }}>
              <p className="text-xl font-bold text-[#A78BFA]">{value}</p>
              <p className="text-xs text-[#6B6B88] mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Travel memories */}
      <div className="rounded-2xl p-5 glass">
        <h2 className="font-semibold text-[#E8E8F0] mb-4 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[#A78BFA]" />Past Travel Memories
        </h2>
        <div className="space-y-4">
          {twin.travelMemories.map(mem => (
            <div key={mem.tripId} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#E8E8F0]">{mem.destination}</p>
                  <p className="text-xs text-[#6B6B88] mt-0.5">{mem.dates.start} – {mem.dates.end}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-amber-400 fill-current" />
                  <span className="text-sm font-bold text-[#E8E8F0]">{mem.satisfactionScore}/100</span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-emerald-400 mb-1.5 flex items-center gap-1">
                    <Check className="h-3 w-3" />Loved
                  </p>
                  <ul className="space-y-0.5">
                    {mem.highlights.map(h => <li key={h} className="text-xs text-[#8888A4]">· {h}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-red-400 mb-1.5 flex items-center gap-1">
                    <X className="h-3 w-3" />Skipped
                  </p>
                  <ul className="space-y-0.5">
                    {mem.skipped.map(s => <li key={s} className="text-xs text-[#8888A4]">· {s}</li>)}
                  </ul>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-[#6B6B88]"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
                <span>Budget ${mem.budgetedSpend} → Spent ${mem.totalSpend}</span>
                <span>{mem.photos} photos</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
