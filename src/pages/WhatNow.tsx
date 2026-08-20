import { Compass, MapPin, Star, DollarSign, Zap, Gem } from 'lucide-react';
import { useTripStore } from '../store/useTripStore';
import { Badge } from '../components/ui/Badge';
import { ScoreRing } from '../components/ui/ScoreRing';
import { WeatherBar } from '../components/WeatherBar';
import type { NowRecommendation } from '../types';

const typeConfig = {
  'best-match': { icon: Zap,        color: '#6C47FF', label: 'Best Match',  sub: 'Highest fit with your Travel Twin', bg: 'rgba(108,71,255,0.12)', border: 'rgba(108,71,255,0.25)' },
  'best-value': { icon: DollarSign, color: '#10b981', label: 'Best Value',  sub: 'Maximum experience per dollar',    bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)'  },
  'hidden-gem': { icon: Gem,        color: '#f59e0b', label: 'Hidden Gem',  sub: 'Off the tourist trail',            bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)'  },
};

function NowCard({ rec }: { rec: NowRecommendation }) {
  const cfg = typeConfig[rec.type];
  const Icon = cfg.icon;
  const act = rec.activity;

  return (
    <div className="rounded-3xl overflow-hidden flex flex-col" style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}` }}>
      {/* Type banner */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${cfg.border}` }}>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: `${cfg.color}25` }}>
            <Icon className="h-4 w-4" style={{ color: cfg.color }} />
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: cfg.color }}>{cfg.label}</p>
            <p className="text-xs text-[#6B6B88]">{cfg.sub}</p>
          </div>
        </div>
        <ScoreRing score={act.personalMatchScore} size="sm" colorByScore={false} />
      </div>

      {/* Image */}
      <div className="relative">
        <img src={act.image} alt={act.name} className="w-full h-44 object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 50%)' }} />
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <p className="font-bold text-lg leading-tight">{act.name}</p>
          <p className="text-xs opacity-75 flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3" />{act.location}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 space-y-3 flex-1">
        <p className="text-sm text-[#8888A4] leading-relaxed">{rec.reason}</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            ['Cost', act.cost === 0 ? 'Free' : `$${act.cost}`],
            ['Distance', `${rec.distanceMinutes}min`],
            ['Duration', `${act.duration}min`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl py-2 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-xs text-[#6B6B88]">{k}</p>
              <p className="font-bold text-sm text-[#E8E8F0] mt-0.5">{v}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-amber-400 font-medium">
            <Star className="h-3 w-3 fill-current" />{act.rating}
          </span>
          <Badge variant={act.crowdLevel === 'low' ? 'green' : act.crowdLevel === 'medium' ? 'yellow' : 'red'}>
            {act.crowdLevel} crowd
          </Badge>
          <Badge variant={act.weatherSuitability === 'indoor' ? 'blue' : 'yellow'}>
            {act.weatherSuitability}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export function WhatNow() {
  const { nowRecs, weather } = useTripStore();

  return (
    <div className="space-y-6 fade-up">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl" style={{ background: 'linear-gradient(135deg,#0EA5E9,#6C47FF)' }}>
          <Compass className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">What Should I Do Now?</h1>
          <p className="text-sm text-[#8888A4] mt-0.5">Real-time recommendations based on your location, time, weather and Travel Twin.</p>
        </div>
      </div>

      {/* Context strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['🕑', '14:00', 'Current time'],
          ['⏱', '3 hrs', 'Free time'],
          ['🍽', '17:30', 'Next: Dinner'],
          [weather.current.icon, `${weather.current.temp}°C`, weather.current.label],
        ].map(([icon, val, label]) => (
          <div key={label} className="rounded-2xl p-3 text-center glass">
            <div className="text-xl mb-1">{icon}</div>
            <p className="font-bold text-sm text-[#E8E8F0]">{val}</p>
            <p className="text-xs text-[#6B6B88] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <WeatherBar weather={weather} />

      <div className="rounded-2xl px-4 py-3 flex gap-3 items-start"
        style={{ background: 'rgba(108,71,255,0.08)', border: '1px solid rgba(108,71,255,0.2)' }}>
        <Compass className="h-5 w-5 text-[#A78BFA] flex-shrink-0 mt-0.5" />
        <p className="text-sm text-[#A78BFA]">
          Analysing <strong>3 hours</strong> of free time · <strong>{weather.current.label}</strong> · your Travel Twin · nearby attractions · live crowd data.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {nowRecs.map(rec => <NowCard key={rec.activity.id} rec={rec} />)}
      </div>

      <p className="text-center text-xs text-[#4B4B60]">Updates automatically as conditions change.</p>
    </div>
  );
}
