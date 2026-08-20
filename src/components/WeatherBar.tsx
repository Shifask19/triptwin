import { Droplets, Thermometer, Sunset } from 'lucide-react';
import type { WeatherCondition } from '../types';

const conditionStyle: Record<string, { bg: string; text: string; border: string }> = {
  sunny:  { bg: 'rgba(245,158,11,0.08)',  text: '#FCD34D', border: 'rgba(245,158,11,0.2)'  },
  cloudy: { bg: 'rgba(148,163,184,0.08)', text: '#94A3B8', border: 'rgba(148,163,184,0.2)' },
  rainy:  { bg: 'rgba(59,130,246,0.08)',  text: '#60A5FA', border: 'rgba(59,130,246,0.2)'  },
  stormy: { bg: 'rgba(100,116,139,0.1)',  text: '#94A3B8', border: 'rgba(100,116,139,0.2)' },
  windy:  { bg: 'rgba(34,211,238,0.08)',  text: '#22D3EE', border: 'rgba(34,211,238,0.2)'  },
  foggy:  { bg: 'rgba(148,163,184,0.06)', text: '#94A3B8', border: 'rgba(148,163,184,0.15)'},
};

export function WeatherBar({ weather }: { weather: WeatherCondition }) {
  const s = conditionStyle[weather.current.condition] ?? conditionStyle.cloudy;

  return (
    <div
      className="flex flex-wrap items-center gap-4 rounded-2xl px-4 py-3 text-sm"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
    >
      <div className="flex items-center gap-2 font-semibold">
        <span className="text-xl">{weather.current.icon}</span>
        <span>{weather.current.label}</span>
        <span className="font-bold">{weather.current.temp}°C</span>
      </div>

      <div className="flex items-center gap-1 opacity-80">
        <Thermometer className="h-4 w-4" />
        <span>Feels {weather.current.feelsLike}°</span>
      </div>

      <div className="flex items-center gap-1 opacity-80">
        <Droplets className="h-4 w-4" />
        <span>{weather.current.humidity}%</span>
      </div>

      <div className="flex items-center gap-1 opacity-80">
        <Sunset className="h-4 w-4" />
        <span>Sunset {weather.sunset}</span>
      </div>

      <div className="ml-auto flex items-center gap-3 overflow-x-auto">
        {weather.hourly.map(h => (
          <div key={h.hour} className="flex flex-col items-center gap-0.5 text-xs opacity-70 flex-shrink-0">
            <span>{h.hour}</span>
            <span className="font-bold">{h.temp}°</span>
            {h.rainChance > 30 && <span className="text-blue-400 font-semibold">{h.rainChance}%</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
