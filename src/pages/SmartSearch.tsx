import { useState } from 'react';
import { Search, Sparkles, MapPin, Clock, Star, DollarSign } from 'lucide-react';
import { useTripStore } from '../store/useTripStore';
import { Badge } from '../components/ui/Badge';
import { ScoreRing } from '../components/ui/ScoreRing';

const SUGGESTIONS = [
  'A romantic place that isn\'t expensive',
  'Somewhere beautiful for photography',
  'I have 2 hours — local culture',
  'Best sunset view under $20',
  'Quiet place away from tourists',
  'Hidden café where locals eat',
  'Something adventurous but safe',
  'Best street food tonight',
];

const crowdColor: Record<string, string> = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };

export function SmartSearch() {
  const { searchResults } = useTripStore();
  const [query,    setQuery]   = useState('');
  const [searched, setSearched]= useState(false);

  const doSearch = (q?: string) => { setQuery(q ?? query); setSearched(true); };

  return (
    <div className="space-y-8 fade-up">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl" style={{ background: 'linear-gradient(135deg,#7C5CFF,#A78BFA)' }}>
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Smart Search</h1>
          <p className="text-sm text-[#8888A4] mt-0.5">Search by intention, not keyword. Describe what you want to feel.</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B6B88]" />
        <input
          type="text" value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doSearch()}
          placeholder="e.g. I want a romantic place that isn't expensive..."
          className="input-dark w-full rounded-2xl py-4 pl-12 pr-28 text-sm"
        />
        <button onClick={() => doSearch()}
          className="absolute right-3 top-1/2 -translate-y-1/2 btn-brand rounded-xl px-4 py-2 text-sm font-semibold text-white">
          Search
        </button>
      </div>

      {/* Suggestion chips */}
      {!searched && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#6B6B88] mb-3">Try asking…</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => doSearch(s)}
                className="rounded-full px-3 py-1.5 text-xs text-[#8888A4] transition-all hover:text-[#A78BFA]"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108,71,255,0.4)'; (e.currentTarget as HTMLElement).style.background = 'rgba(108,71,255,0.08)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}>
                {s}
              </button>
            ))}
          </div>

          {/* Feature explanation */}
          <div className="mt-6 rounded-2xl px-4 py-4 flex gap-3"
            style={{ background: 'rgba(108,71,255,0.06)', border: '1px solid rgba(108,71,255,0.15)' }}>
            <Sparkles className="h-5 w-5 text-[#A78BFA] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#C4B5FD] text-sm">Experience-driven, not keyword-driven</p>
              <p className="text-xs text-[#8888A4] leading-relaxed mt-1">
                TripTwin maps your intent to experiences using your Travel Twin profile. "Quiet place" means something different for you than for anyone else.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {searched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#8888A4]">{searchResults.length} results for <em className="text-[#E8E8F0]">"{query}"</em></p>
            <button onClick={() => { setSearched(false); setQuery(''); }}
              className="text-xs text-[#A78BFA] hover:text-[#C4B5FD]">Clear</button>
          </div>

          {searchResults.map(result => (
            <div key={result.activity.id} className="rounded-2xl overflow-hidden glass glass-hover">
              <div className="flex">
                <img src={result.activity.image} alt={result.activity.name}
                  className="h-full w-28 flex-shrink-0 object-cover sm:w-40" />
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-[#E8E8F0] text-sm">{result.activity.name}</p>
                        <p className="text-xs text-[#6B6B88] flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />{result.activity.location}
                        </p>
                      </div>
                      <div className="flex flex-col items-center flex-shrink-0">
                        <ScoreRing score={result.intentMatch} size="sm" />
                        <span className="text-xs text-[#6B6B88] mt-0.5">intent</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#6B6B88] mt-2 leading-relaxed line-clamp-2">{result.activity.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {result.matchReasons.map(r => (
                        <span key={r} className="rounded-full px-2 py-0.5 text-xs text-[#A78BFA]"
                          style={{ background: 'rgba(108,71,255,0.1)', border: '1px solid rgba(108,71,255,0.2)' }}>
                          ✓ {r}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#8888A4]">
                    <span className="flex items-center gap-0.5 font-medium text-[#E8E8F0]">
                      <DollarSign className="h-3 w-3 text-[#6B6B88]" />
                      {result.activity.cost === 0 ? 'Free' : `$${result.activity.cost}`}
                    </span>
                    <span className="flex items-center gap-0.5 text-amber-400">
                      <Star className="h-3 w-3 fill-current" />{result.activity.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full" style={{ background: crowdColor[result.activity.crowdLevel] }} />
                      {result.activity.crowdLevel}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />{result.activity.duration}min
                    </span>
                    <Badge variant={result.activity.personalMatchScore >= 80 ? 'green' : 'yellow'}>
                      {result.activity.personalMatchScore}% match
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
