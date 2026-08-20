import { Clock, MapPin, Camera, DollarSign, TrendingUp, Check, X } from 'lucide-react';
import { useTripStore } from '../store/useTripStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ScoreRing } from '../components/ui/ScoreRing';
import { ProgressBar } from '../components/ui/ProgressBar';

const countryFlag: Record<string, string> = {
  'Paris, France': '🇫🇷',
  'Bangkok, Thailand': '🇹🇭',
  'Tokyo, Japan': '🇯🇵',
  'Kyoto, Japan': '🇯🇵',
};

export function TravelMemory() {
  const { pastTrips, upcomingTrips, trip: activeTrip, twin } = useTripStore();

  const insights = [
    { icon: '🍜', text: 'You consistently love local food markets — rated 5★ in Bangkok & Paris' },
    { icon: '🏛️', text: 'You\'ve skipped 4 of 5 museums — your twin has deprioritised them' },
    { icon: '💰', text: 'You spend an average of $22/activity vs $30 planned — great at saving' },
    { icon: '🌿', text: 'Outdoor experiences in cooler hours score 30% higher for you' },
    { icon: '📸', text: 'Photography moments correlate with hidden gems, not landmarks' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-200">
          <Clock className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Travel Memory</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Every trip recorded, every preference learned. The longer you travel with TripTwin, the smarter it gets.
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-indigo-600">{twin.tripsCompleted}</p>
          <p className="text-xs text-gray-400 mt-1">Trips completed</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-emerald-600">{twin.twinAccuracy}%</p>
          <p className="text-xs text-gray-400 mt-1">Twin accuracy</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-amber-600">555</p>
          <p className="text-xs text-gray-400 mt-1">Photos logged</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-purple-600">$1,470</p>
          <p className="text-xs text-gray-400 mt-1">Total spent</p>
        </Card>
      </div>

      {/* Active trip */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">Current Trip</h2>
        <Card padding="none" className="overflow-hidden border-2 border-indigo-200">
          <div className="relative">
            <img src={activeTrip.coverImage} alt={activeTrip.destination} className="h-36 w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
            <div className="absolute inset-0 flex items-end p-4 text-white">
              <div>
                <p className="text-xs font-medium opacity-75">🔴 Recording now</p>
                <p className="text-xl font-bold">{activeTrip.name}</p>
                <p className="text-sm opacity-80 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />{activeTrip.destination}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 flex items-center justify-between">
            <Badge variant="blue">In progress</Badge>
            <span className="text-xs text-gray-500">{activeTrip.dates.start} → {activeTrip.dates.end}</span>
          </div>
        </Card>
      </div>

      {/* Past trips */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">Past Trips</h2>
        <div className="space-y-5">
          {twin.travelMemories.map(mem => {
            const trip = pastTrips.find(t => t.id === mem.tripId);
            const flag = countryFlag[mem.destination] ?? '🌍';
            const budgetDiff = mem.budgetedSpend - mem.totalSpend;
            return (
              <Card key={mem.tripId} padding="none" className="overflow-hidden">
                <div className="relative">
                  <img
                    src={trip?.coverImage ?? 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80'}
                    alt={mem.destination}
                    className="h-32 w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                  <div className="absolute inset-0 flex items-end p-4 text-white">
                    <div>
                      <p className="text-xl font-bold">{flag} {mem.destination}</p>
                      <p className="text-xs opacity-75">{mem.dates.start} – {mem.dates.end}</p>
                    </div>
                    <div className="ml-auto">
                      <ScoreRing score={mem.satisfactionScore} size="md" colorByScore />
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-gray-50 p-2">
                      <Camera className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                      <p className="font-bold text-gray-900">{mem.photos}</p>
                      <p className="text-xs text-gray-400">Photos</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-2">
                      <DollarSign className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                      <p className="font-bold text-gray-900">${mem.totalSpend}</p>
                      <p className="text-xs text-gray-400">Spent</p>
                    </div>
                    <div className={`rounded-xl p-2 ${budgetDiff >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                      <TrendingUp className={`h-4 w-4 mx-auto mb-1 ${budgetDiff >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
                      <p className={`font-bold ${budgetDiff >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                        {budgetDiff >= 0 ? `$${budgetDiff} saved` : `$${Math.abs(budgetDiff)} over`}
                      </p>
                      <p className="text-xs text-gray-400">vs budget</p>
                    </div>
                  </div>

                  {/* Highlights & skipped */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-emerald-600 mb-2 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Loved
                      </p>
                      <ul className="space-y-1">
                        {mem.highlights.map(h => (
                          <li key={h} className="flex items-start gap-1.5 text-xs text-gray-600">
                            <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-red-500 mb-2 flex items-center gap-1">
                        <X className="h-3 w-3" /> Skipped
                      </p>
                      <ul className="space-y-1">
                        {mem.skipped.map(s => (
                          <li key={s} className="flex items-start gap-1.5 text-xs text-gray-500">
                            <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-red-300 flex-shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 text-right italic">
                    This data has been absorbed into your Travel Twin ✓
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">Upcoming</h2>
        {upcomingTrips.map(t => (
          <Card key={t.id} className="flex items-center gap-4">
            <img src={t.coverImage} alt={t.destination} className="h-14 w-14 rounded-xl object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{t.name}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" />{t.destination}
              </p>
            </div>
            <div className="text-right">
              <Badge variant="purple">Planning</Badge>
              <p className="text-xs text-gray-400 mt-1">{t.dates.start}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Pattern insights */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-indigo-600" />
          What your Twin has learned from your travels
        </h2>
        <div className="space-y-3">
          {insights.map((ins, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl bg-indigo-50 px-3 py-2.5">
              <span className="text-lg">{ins.icon}</span>
              <p className="text-sm text-indigo-800">{ins.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-700">Twin accuracy progress</span>
            <span className="font-semibold text-indigo-600">{twin.twinAccuracy}% → target 95%</span>
          </div>
          <ProgressBar value={twin.twinAccuracy} color="indigo" size="md" />
          <p className="text-xs text-gray-400 mt-1.5">Increases with every completed trip and rated activity</p>
        </div>
      </Card>
    </div>
  );
}
