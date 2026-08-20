import { Clock, MapPin, Camera, DollarSign, TrendingUp, Check, X } from 'lucide-react';
import { useTripStore } from '../store/useTripStore';
import { Badge } from '../components/ui/Badge';
import { ScoreRing } from '../components/ui/ScoreRing';
import { ProgressBar } from '../components/ui/ProgressBar';

const countryFlag: Record<string, string> = {
  'Paris, France': '🇫🇷', 'Bangkok, Thailand': '🇹🇭',
  'Tokyo, Japan': '🇯🇵', 'Kyoto, Japan': '🇯🇵', 'Mumbai, India': '🇮🇳',
  'Dubai, UAE': '🇦🇪', 'Goa, India': '🇮🇳', 'Kerala, India': '🇮🇳',
};

const insights = [
  { icon: '🍜', text: 'You consistently love local food markets — rated 5★ in Bangkok & Paris' },
  { icon: '🏛️', text: 'You\'ve skipped 4 of 5 museums — your Twin has deprioritised them' },
  { icon: '💰', text: 'You spend $22/activity avg vs $30 planned — naturally budget-smart' },
  { icon: '🌿', text: 'Outdoor experiences in cooler hours score 30% higher for you' },
  { icon: '📸', text: 'Photography moments correlate with hidden gems, not landmarks' },
];

export function TravelMemory() {
  const { pastTrips, upcomingTrips, trip: activeTrip, twin } = useTripStore();

  return (
    <div className="space-y-6 fade-up">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
          style={{ background: 'linear-gradient(135deg,#ec4899,#f43f5e)' }}>
          <Clock className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Travel Memory</h1>
          <p className="text-sm text-[#8888A4] mt-0.5">Every trip recorded, every preference learned. Gets smarter every journey.</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { val: twin.tripsCompleted, label: 'Trips completed', color: '#6C47FF' },
          { val: `${twin.twinAccuracy}%`, label: 'Twin accuracy', color: '#10b981' },
          { val: '555', label: 'Photos logged', color: '#f59e0b' },
          { val: '$1,470', label: 'Total spent', color: '#A78BFA' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center glass">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.val}</p>
            <p className="text-xs text-[#8888A4] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Active trip */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B6B88] mb-3">Current Trip</p>
        <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid rgba(108,71,255,0.3)' }}>
          <div className="relative">
            <img src={activeTrip.coverImage} alt={activeTrip.destination} className="h-32 w-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right,rgba(0,0,0,0.7),transparent)' }} />
            <div className="absolute inset-0 flex items-end p-4 text-white">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 pulse-soft" />
                  <span className="text-xs text-emerald-400 font-medium">Recording now</span>
                </div>
                <p className="text-xl font-bold">{activeTrip.name}</p>
                <p className="text-sm opacity-70 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />{activeTrip.destination}
                </p>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 flex items-center justify-between glass">
            <Badge variant="blue">In progress</Badge>
            <span className="text-xs text-[#6B6B88]">{activeTrip.dates.start} → {activeTrip.dates.end}</span>
          </div>
        </div>
      </div>

      {/* Past trips */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B6B88] mb-3">Past Trips</p>
        <div className="space-y-4">
          {twin.travelMemories.map(mem => {
            const trip = pastTrips.find(t => t.id === mem.tripId);
            const flag = countryFlag[mem.destination] ?? '🌍';
            const saved = mem.budgetedSpend - mem.totalSpend;
            return (
              <div key={mem.tripId} className="rounded-2xl overflow-hidden glass">
                <div className="relative">
                  <img
                    src={trip?.coverImage ?? 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80'}
                    alt={mem.destination} className="h-28 w-full object-cover"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to right,rgba(0,0,0,0.7),transparent)' }} />
                  <div className="absolute inset-0 flex items-end justify-between p-4 text-white">
                    <div>
                      <p className="text-lg font-bold">{flag} {mem.destination}</p>
                      <p className="text-xs opacity-60">{mem.dates.start} – {mem.dates.end}</p>
                    </div>
                    <ScoreRing score={mem.satisfactionScore} size="sm" colorByScore />
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <Camera className="h-4 w-4 text-[#6B6B88] mx-auto mb-1" />
                      <p className="font-bold text-[#E8E8F0] text-sm">{mem.photos}</p>
                      <p className="text-xs text-[#6B6B88]">Photos</p>
                    </div>
                    <div className="rounded-xl py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <DollarSign className="h-4 w-4 text-[#6B6B88] mx-auto mb-1" />
                      <p className="font-bold text-[#E8E8F0] text-sm">${mem.totalSpend}</p>
                      <p className="text-xs text-[#6B6B88]">Spent</p>
                    </div>
                    <div className="rounded-xl py-2" style={{ background: saved >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
                      <TrendingUp className="h-4 w-4 mx-auto mb-1" style={{ color: saved >= 0 ? '#10b981' : '#ef4444' }} />
                      <p className="font-bold text-sm" style={{ color: saved >= 0 ? '#10b981' : '#ef4444' }}>
                        {saved >= 0 ? `$${saved} saved` : `$${Math.abs(saved)} over`}
                      </p>
                      <p className="text-xs text-[#6B6B88]">vs budget</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-emerald-400 mb-1.5 flex items-center gap-1">
                        <Check className="h-3 w-3" />Loved
                      </p>
                      <ul className="space-y-0.5">
                        {mem.highlights.map(h => (
                          <li key={h} className="flex items-start gap-1.5 text-xs text-[#8888A4]">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />{h}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-red-400 mb-1.5 flex items-center gap-1">
                        <X className="h-3 w-3" />Skipped
                      </p>
                      <ul className="space-y-0.5">
                        {mem.skipped.map(s => (
                          <li key={s} className="flex items-start gap-1.5 text-xs text-[#8888A4]">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-400 flex-shrink-0" />{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="text-xs text-[#4B4B60] italic">✓ Absorbed into your Travel Twin</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming */}
      {upcomingTrips.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#6B6B88] mb-3">Upcoming</p>
          {upcomingTrips.map(t => (
            <div key={t.id} className="flex items-center gap-4 rounded-2xl p-4 glass">
              <img src={t.coverImage} alt={t.destination} className="h-14 w-14 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#E8E8F0]">{t.name}</p>
                <p className="text-xs text-[#6B6B88] flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />{t.destination}
                </p>
              </div>
              <div className="text-right">
                <Badge variant="purple">Planning</Badge>
                <p className="text-xs text-[#6B6B88] mt-1">{t.dates.start}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Twin insights */}
      <div className="rounded-2xl p-5 glass">
        <h2 className="font-semibold text-[#E8E8F0] mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[#A78BFA]" />What your Twin has learned
        </h2>
        <div className="space-y-2.5">
          {insights.map((ins, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{ background: 'rgba(108,71,255,0.06)', border: '1px solid rgba(108,71,255,0.12)' }}>
              <span className="text-lg">{ins.icon}</span>
              <p className="text-sm text-[#C0C0D8]">{ins.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-[#8888A4]">Twin accuracy progress</span>
            <span className="font-semibold text-[#A78BFA]">{twin.twinAccuracy}% → target 95%</span>
          </div>
          <ProgressBar value={twin.twinAccuracy} color="purple" size="md" />
          <p className="text-xs text-[#4B4B60] mt-1.5">Increases with every completed trip and rated activity</p>
        </div>
      </div>
    </div>
  );
}
