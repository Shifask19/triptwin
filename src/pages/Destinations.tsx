import { useState } from 'react';
import { MapPin, Star, Clock, DollarSign, Search, Globe } from 'lucide-react';
import { destinationCatalogue, globalTrips } from '../data/destinations';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ScoreRing } from '../components/ui/ScoreRing';
import type { Activity } from '../types';

const crowdDot: Record<string, string> = {
  low: 'bg-emerald-500', medium: 'bg-amber-500', high: 'bg-red-500',
};

function ActivityCard({ activity }: { activity: Activity }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="rounded-2xl border border-gray-100 bg-white overflow-hidden hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer"
      onClick={() => setExpanded(v => !v)}
    >
      <div className="relative">
        <img src={activity.image} alt={activity.name} className="w-full h-36 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
          <div>
            <p className="font-semibold text-white text-sm leading-tight">{activity.name}</p>
            <p className="text-white/70 text-xs">{activity.location}</p>
          </div>
          <ScoreRing score={activity.personalMatchScore} size="sm" colorByScore={false} />
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant={activity.touristTrapScore > 60 ? 'red' : activity.touristTrapScore > 30 ? 'yellow' : 'green'} size="sm">
            {activity.touristTrapScore < 20 ? '💎 Gem' : activity.touristTrapScore < 40 ? '✓ Fair' : '⚠ Trap'}
          </Badge>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
          <span className="flex items-center gap-1 font-medium text-gray-700">
            <DollarSign className="h-3 w-3" />
            {activity.cost === 0 ? 'Free' : `$${activity.cost}`}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 text-amber-400 fill-current" />
            {activity.rating}
          </span>
          <span className="flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${crowdDot[activity.crowdLevel]}`} />
            {activity.crowdLevel}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />{activity.duration}m
          </span>
        </div>
        {expanded && (
          <p className="text-xs text-gray-500 leading-relaxed mt-1">{activity.description}</p>
        )}
      </div>
    </div>
  );
}

export function Destinations() {
  const [selectedRegion, setSelectedRegion] = useState<string>('India');
  const [selectedCity, setSelectedCity]     = useState<string>('Mumbai');
  const [searchQuery, setSearchQuery]       = useState('');

  const region = destinationCatalogue.find(r => r.region === selectedRegion);
  const dest   = region?.destinations.find(d => d.city === selectedCity);

  const filteredActivities = (dest?.activities ?? []).filter(a =>
    searchQuery === '' ||
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const relatedTrips = globalTrips.filter(t =>
    t.destination.toLowerCase().includes(selectedCity.toLowerCase()) ||
    t.destination.toLowerCase().includes(selectedRegion.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-200">
          <Globe className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Destinations</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Explore India, Dubai & the world — every activity scored against your Travel Twin.
          </p>
        </div>
      </div>

      {/* Region tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {destinationCatalogue.map(r => (
          <button
            key={r.region}
            onClick={() => {
              setSelectedRegion(r.region);
              setSelectedCity(r.destinations[0].city);
              setSearchQuery('');
            }}
            className={`flex-shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              selectedRegion === r.region
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-700'
            }`}
          >
            <span>{r.flag}</span> {r.region}
          </button>
        ))}
      </div>

      {/* City selector */}
      {region && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {region.destinations.map(d => (
            <button
              key={d.city}
              onClick={() => { setSelectedCity(d.city); setSearchQuery(''); }}
              className={`relative overflow-hidden rounded-2xl border-2 text-left transition-all ${
                selectedCity === d.city
                  ? 'border-indigo-500 shadow-md shadow-indigo-100'
                  : 'border-transparent hover:border-indigo-200'
              }`}
            >
              <img src={d.image} alt={d.city} className="h-24 w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-2 left-3">
                <p className="font-bold text-white text-sm">{d.city}</p>
                <p className="text-white/70 text-xs">{d.tag}</p>
              </div>
              {d.activities.length === 0 && (
                <div className="absolute top-2 right-2 rounded-full bg-black/40 px-2 py-0.5 text-xs text-white/70">
                  Coming soon
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Activity search */}
      {(dest?.activities.length ?? 0) > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Search activities in ${selectedCity}...`}
            className="w-full rounded-2xl border border-gray-200 py-3 pl-10 pr-4 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      )}

      {/* Activities grid */}
      {filteredActivities.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">
              {selectedCity} — {filteredActivities.length} experiences
            </h2>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Low crowd</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />Medium</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />High</span>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredActivities.map(act => (
              <ActivityCard key={act.id} activity={act} />
            ))}
          </div>
        </div>
      ) : dest?.activities.length === 0 ? (
        <Card className="text-center py-12 space-y-2 text-gray-400">
          <Globe className="h-10 w-10 mx-auto opacity-30" />
          <p className="font-medium text-gray-600">{selectedCity} — Coming Soon</p>
          <p className="text-sm">We're curating activities for this destination.</p>
        </Card>
      ) : (
        <Card className="text-center py-8 text-gray-400">
          <p>No activities match "{searchQuery}"</p>
        </Card>
      )}

      {/* Related trip plans */}
      {relatedTrips.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-indigo-600" />
            Ready-made Trip Plans for {selectedRegion}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {relatedTrips.map(trip => (
              <Card key={trip.id} padding="none" hover className="overflow-hidden">
                <img src={trip.coverImage} alt={trip.name} className="h-32 w-full object-cover" />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-gray-900">{trip.name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />{trip.destination}
                      </p>
                    </div>
                    <Badge variant="purple">Plan</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-gray-50 p-2">
                      <p className="font-bold text-gray-900">${trip.budget.total}</p>
                      <p className="text-gray-400">Budget</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-2">
                      <p className="font-bold text-gray-900">
                        {Math.ceil((new Date(trip.dates.end).getTime() - new Date(trip.dates.start).getTime()) / 86400000)} days
                      </p>
                      <p className="text-gray-400">Duration</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-2">
                      <p className="font-bold text-gray-900">{trip.itinerary.flatMap(d => d.activities).length}</p>
                      <p className="text-gray-400">Activities</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
