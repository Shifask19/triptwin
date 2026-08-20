import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Calendar, Users, Zap, Brain, Shield, Compass,
  TrendingUp, CheckCircle, Clock, DollarSign, AlertTriangle, ArrowRight,
} from 'lucide-react';
import { useTripStore } from '../store/useTripStore';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { WeatherBar } from '../components/WeatherBar';
import { TripSwapModal } from '../components/TripSwapModal';

function StatCard({ value, label, icon: Icon, color }: { value: string; label: string; icon: React.ElementType; color: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-[#8888A4] mt-1">{label}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${color}18` }}>
          <Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18, color }} />
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, sub, color, onClick }: {
  icon: React.ElementType; label: string; sub: string; color: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl p-3.5 text-left transition-all group"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = 'rgba(108,71,255,0.08)';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108,71,255,0.25)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
      }}
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}18` }}>
        <Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18, color }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm text-[#E8E8F0]">{label}</p>
        <p className="text-xs text-[#6B6B88]">{sub}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-[#4B4B60] group-hover:text-[#A78BFA] transition-colors" />
    </button>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const store = useTripStore();
  const { trip, twin, weather, swapAlert, acceptSwap, dismissSwap } = store;
  const [showSwapModal, setShowSwapModal] = useState(false);

  const totalSpent = Object.values(trip.budget.spent).reduce((a, b) => Number(a) + Number(b), 0) as number;
  const spentPct   = Math.round((totalSpent / trip.budget.total) * 100);
  const completedActs = trip.itinerary.flatMap(d => d.activities).filter(a => a.status === 'completed').length;
  const totalActs     = trip.itinerary.flatMap(d => d.activities).length;
  const today = trip.itinerary.find(d => d.date === '2026-08-19') ?? trip.itinerary[1] ?? trip.itinerary[0];

  return (
    <div className="space-y-5 fade-up">

      {showSwapModal && swapAlert && (
        <TripSwapModal
          alert={swapAlert}
          onAccept={(id) => { acceptSwap(id); setShowSwapModal(false); }}
          onDismiss={() => { dismissSwap(); setShowSwapModal(false); }}
        />
      )}

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl" style={{ minHeight: 200 }}>
        <img src={trip.coverImage} alt={trip.destination} className="h-52 w-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0.3) 60%,transparent 100%)' }} />
        {/* Brand glow overlay */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(180deg,transparent 40%,rgba(108,71,255,0.15) 100%)' }} />

        <div className="absolute inset-0 flex flex-col justify-between p-6">
          {/* Top pill */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white"
              style={{ background: 'rgba(108,71,255,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-soft" />
              Active Trip
            </span>
            {trip.groupCompatibility && (
              <div className="flex items-center gap-2 rounded-full px-3 py-1.5"
                style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span className="text-xs text-white/70">Group</span>
                <span className="text-sm font-bold text-[#A78BFA]">{trip.groupCompatibility}%</span>
              </div>
            )}
          </div>

          {/* Bottom */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{trip.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/75">
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{trip.destination}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{trip.dates.start} → {trip.dates.end}</span>
              <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{trip.travelers.length} travelers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weather */}
      <WeatherBar weather={weather} />

      {/* TripSwap alert */}
      {swapAlert && !store.swapDismissed && (
        <button
          type="button"
          onClick={() => setShowSwapModal(true)}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.12)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.08)'}
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
            style={{ background: 'rgba(245,158,11,0.2)' }}>
            <Zap className="h-5 w-5 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-amber-300 text-sm">TripSwap Alert — Better option found</p>
            <p className="text-xs text-amber-400/70 truncate">{swapAlert.reason}</p>
          </div>
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
        </button>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard value={`${completedActs}/${totalActs}`} label="Activities done" icon={CheckCircle} color="#10b981" />
        <StatCard value={`$${totalSpent}`} label={`of $${trip.budget.total}`} icon={DollarSign} color="#6C47FF" />
        <StatCard value={`${twin.twinAccuracy}%`} label="Twin accuracy" icon={Brain} color="#A78BFA" />
        <StatCard value={`${twin.tripsCompleted}`} label="Trips logged" icon={TrendingUp} color="#38BDF8" />
      </div>

      {/* Today + Quick actions */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Today's schedule */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <p className="font-semibold text-[#E8E8F0] text-sm">Today's Schedule</p>
              <p className="text-xs text-[#6B6B88] mt-0.5">{today?.dayLabel}</p>
            </div>
            <button
              onClick={() => navigate('/itinerary')}
              className="flex items-center gap-1 text-xs font-medium text-[#A78BFA] hover:text-[#C4B5FD] transition-colors">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {today?.activities.map(act => (
              <div key={act.id} className="flex items-center gap-3 px-5 py-3.5">
                <img src={act.image} alt={act.name}
                  className={`h-11 w-11 rounded-xl object-cover flex-shrink-0 ${act.status === 'completed' ? 'opacity-50 grayscale' : ''}`} />
                <div className="min-w-0 flex-1">
                  <p className={`truncate font-medium text-sm ${act.status === 'completed' ? 'text-[#6B6B88] line-through' : 'text-[#E8E8F0]'}`}>
                    {act.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-0.5 text-xs text-[#6B6B88]">
                      <Clock className="h-3 w-3" />{act.startTime}
                    </span>
                    <span className="text-[#4B4B60]">·</span>
                    <span className="text-xs text-[#6B6B88]">{act.cost === 0 ? 'Free' : `$${act.cost}`}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge variant={act.status === 'completed' ? 'green' : act.status === 'skipped' ? 'gray' : 'blue'}>
                    {act.status}
                  </Badge>
                  <span className={`text-xs font-semibold ${
                    act.personalMatchScore >= 80 ? 'text-emerald-400'
                    : act.personalMatchScore >= 60 ? 'text-amber-400'
                    : 'text-red-400'}`}>
                    {act.personalMatchScore}% match
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-col gap-2.5">
          <QuickAction icon={Compass}   label="What Should I Do Now?"  sub="Real-time suggestions"          color="#6C47FF" onClick={() => navigate('/now')} />
          <QuickAction icon={Shield}    label="Tourist Trap Detector"   sub="Analyse upcoming activities"    color="#ef4444" onClick={() => navigate('/trap-detector')} />
          <QuickAction icon={Brain}     label="Travel Twin"             sub={`${twin.twinAccuracy}% accurate profile`} color="#A78BFA" onClick={() => navigate('/travel-twin')} />

          {/* Budget mini */}
          <button
            onClick={() => navigate('/budget')}
            className="flex items-center gap-3 rounded-2xl p-3.5 text-left transition-all group"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='rgba(108,71,255,0.08)'; (e.currentTarget as HTMLElement).style.borderColor='rgba(108,71,255,0.25)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'; (e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.07)'; }}
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <DollarSign className="h-4.5 w-4.5" style={{ width:18,height:18,color:'#10b981' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <p className="font-semibold text-sm text-[#E8E8F0]">Budget</p>
                <span className="text-xs font-bold text-[#A78BFA]">{spentPct}%</span>
              </div>
              <ProgressBar value={spentPct} color={spentPct > 90 ? 'red' : spentPct > 70 ? 'amber' : 'emerald'} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
