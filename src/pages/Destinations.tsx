import { useState } from 'react';
import { MapPin, Star, Clock, DollarSign, Search, Globe } from 'lucide-react';
import { destinationCatalogue, globalTrips } from '../data/destinations';
import { Badge } from '../components/ui/Badge';
import { ScoreRing } from '../components/ui/ScoreRing';
import type { Activity } from '../types';

const crowdColor: Record<string, string> = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };

function ActivityCard({ activity }: { activity: Activity }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="rounded-2xl overflow-hidden glass glass-hover cursor-pointer"
      onClick={() => setExpanded(v => !v)}
    >
      <div className="relative">
        <img src={activity.image} alt={activity.name} className="w-full h-36 object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.75) 0%,transparent 50%)' }} />
        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
          <div>
            <p className="font-semibold text-white text-sm leading-tight line-clamp-2">{activity.name}</p>
            <p className="text-white/60 text-xs mt-0.5">{activity.location}</p>
          </div>
          <ScoreRing score={activity.personalMatchScore} size="sm" colorByScore={false} />
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant={activity.touristTrapScore < 20 ? 'green' : activity.touristTrapScore < 40 ? 'yellow' : 'red'} size="sm">
            {activity.touristTrapScore < 20 ? '💎 Gem' : activity.touristTrapScore < 40 ? '✓ Fair' : '⚠ Trap'}
          </Badge>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-medium text-[#E8E8F0] flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-[#6B6B88]" />
            {activity.cost === 0 ? 'Free' : `$${activity.cost}`}
          </span>
          <span className="flex items-center gap-0.5 text-amber-400">
            <Star className="h-3 w-3 fill-current" />{activity.rating}
          </span>
          <span className="flex items-center gap-1 text-xs" style={{ color: crowdColor[activity.crowdLevel] }}>
            <span className="h-2 w-2 rounded-full" style={{ background: crowdColor[activity.crowdLevel] }} />
            {activity.crowdLevel}
          </span>
          <span className="flex items-center gap-0.5 text-[#6B6B88]">
            <Clock className="h-3 w-3" />{activity.duration}m
          </span>
        </div>
        {expanded && (
          <p className="text-xs text-[#8888A4] leading-relaxed pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {activity.description}
          </p>
        )}
      </div>
    </div>
  );
}

export function Destinations() {
  const [selectedRegion, setSelectedRegion] = useState('India');
  const [selectedCity,   setSelectedCity]   = useState('Mumbai');
  const [searchQuery,    setSearchQuery]    = useState('');

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
    <div className="space-y-6 fade-up">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
          style={{ background: 'linear-gradient(135deg,#0EA5E9,#6C47FF)' }}>
          <Globe className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Destinations</h1>
          <p className="text-sm text-[#8888A4] mt-0.5">
            India, Dubai & the world — every activity scored against your Travel Twin.
          </p>
        </div>
      </div>

      {/* Region tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {destinationCatalogue.map(r => (
          <button key={r.region}
            onClick={() => { setSelectedRegion(r.region); setSelectedCity(r.destinations[0].city); setSearchQuery(''); }}
            className="flex-shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all"
            style={{
              background: selectedRegion === r.region ? 'linear-gradient(135deg,#7C5CFF,#6C47FF)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${selectedRegion === r.region ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
              color: selectedRegion === r.region ? 'white' : '#8888A4',
              boxShadow: selectedRegion === r.region ? '0 4px 16px rgba(108,71,255,0.3)' : 'none',
            }}>
            <span>{r.flag}</span>{r.region}
          </button>
        ))}
      </div>

      {/* City selector */}
      {region && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {region.destinations.map(d => (
            <button key={d.city}
              onClick={() => { setSelectedCity(d.city); setSearchQuery(''); }}
              className="relative overflow-hidden rounded-2xl text-left transition-all"
              style={{ border: `2px solid ${selectedCity === d.city ? '#6C47FF' : 'transparent'}`,
                boxShadow: selectedCity === d.city ? '0 0 0 1px rgba(108,71,255,0.3), 0 8px 24px rgba(108,71,255,0.2)' : 'none' }}>
              <img src={d.image} alt={d.city} className="h-24 w-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.8) 0%,transparent 50%)' }} />
              <div className="absolute bottom-2 left-3">
                <p className="font-bold text-white text-sm">{d.city}</p>
                <p className="text-white/60 text-xs">{d.tag}</p>
              </div>
              {d.activities.length === 0 && (
                <div className="absolute top-2 right-2 rounded-full px-2 py-0.5 text-xs text-white/60"
                  style={{ background: 'rgba(0,0,0,0.5)' }}>Soon</div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      {(dest?.activities.length ?? 0) > 0 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6B88]" />
          <input type="text" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Search activities in ${selectedCity}...`}
            className="input-dark w-full rounded-2xl py-3 pl-10 pr-4 text-sm" />
        </div>
      )}

      {/* Activities */}
      {filteredActivities.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-[#E8E8F0]">{selectedCity} — {filteredActivities.length} experiences</p>
            <div className="flex items-center gap-3 text-xs text-[#6B6B88]">
              {[['#10b981','Low'], ['#f59e0b','Med'], ['#ef4444','High']].map(([c, l]) => (
                <span key={l} className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full" style={{ background: c }} />{l}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredActivities.map(act => <ActivityCard key={act.id} activity={act} />)}
          </div>
        </div>
      ) : dest?.activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center glass rounded-2xl space-y-2">
          <Globe className="h-10 w-10 text-[#4B4B60]" />
          <p className="font-semibold text-[#E8E8F0]">{selectedCity} — Coming Soon</p>
          <p className="text-sm text-[#6B6B88]">We're curating the best activities for this destination.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center glass rounded-2xl">
          <p className="text-[#8888A4]">No activities match "{searchQuery}"</p>
        </div>
      )}

      {/* Related trip plans */}
      {relatedTrips.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#6B6B88] mb-3">
            Ready-made Trip Plans — {selectedRegion}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {relatedTrips.map(trip => (
              <div key={trip.id} className="rounded-2xl overflow-hidden glass glass-hover">
                <img src={trip.coverImage} alt={trip.name} className="h-32 w-full object-cover" />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-[#E8E8F0]">{trip.name}</p>
                      <p className="text-sm text-[#6B6B88] flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />{trip.destination}
                      </p>
                    </div>
                    <Badge variant="purple">Plan</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    {[
                      [`$${trip.budget.total}`, 'Budget'],
                      [`${Math.ceil((new Date(trip.dates.end).getTime()-new Date(trip.dates.start).getTime())/86400000)}d`, 'Duration'],
                      [`${trip.itinerary.flatMap(d => d.activities).length}`, 'Activities'],
                    ].map(([v, l]) => (
                      <div key={l} className="rounded-xl py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p className="font-bold text-[#E8E8F0] text-sm">{v}</p>
                        <p className="text-xs text-[#6B6B88]">{l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
