import { useState } from 'react';
import { Zap, CloudRain, Users, Clock, CheckCircle } from 'lucide-react';
import { useTripStore } from '../store/useTripStore';
import { TripSwapModal } from '../components/TripSwapModal';
import { Badge } from '../components/ui/Badge';

function HowItWorks() {
  const steps = [
    { icon: '📡', title: 'Monitor', desc: 'Tracks weather, crowds, closures & your position continuously.' },
    { icon: '🧠', title: 'Analyse', desc: 'Compares live conditions against your plan and Travel Twin.' },
    { icon: '🔄', title: 'Find Better', desc: 'Searches alternatives that score higher on your Match Score.' },
    { icon: '✅', title: 'You Decide', desc: 'Accept, keep original, or pick from alternatives.' },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => (
        <div key={i} className="rounded-2xl p-4 text-center space-y-2 glass">
          <div className="text-3xl">{s.icon}</div>
          <p className="font-semibold text-[#E8E8F0] text-sm">{s.title}</p>
          <p className="text-xs text-[#8888A4] leading-relaxed">{s.desc}</p>
        </div>
      ))}
    </div>
  );
}

export function TripSwapPage() {
  const { swapAlert, acceptSwap, dismissSwap } = useTripStore();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-8 fade-up">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl btn-brand">
          <Zap className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">TripSwap</h1>
          <p className="text-sm text-[#8888A4] mt-0.5">Real-time plan optimisation — your itinerary adapts to conditions, not the other way around.</p>
        </div>
      </div>

      <HowItWorks />

      {/* Live signals */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B6B88] mb-3">Live Signals Right Now</p>
        {!swapAlert ? (
          <div className="flex items-center gap-3 rounded-2xl p-4 glass">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="font-semibold text-emerald-400 text-sm">All clear</p>
              <p className="text-xs text-[#8888A4]">No swaps needed — conditions look good for your current plan.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {swapAlert.signals.map((sig, i) => {
              const isCrit = sig.severity === 'critical';
              const IconEl = sig.type === 'weather' ? CloudRain : sig.type === 'crowd' ? Users : Clock;
              return (
                <div key={i} className="flex items-center gap-3 rounded-2xl px-4 py-3"
                  style={{ background: isCrit ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${isCrit ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                  <IconEl className="h-5 w-5 flex-shrink-0" style={{ color: isCrit ? '#f87171' : '#fbbf24' }} />
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: isCrit ? '#f87171' : '#fbbf24' }}>{sig.label}</p>
                    <p className="text-xs text-[#8888A4]">{sig.value}</p>
                  </div>
                  <Badge variant={isCrit ? 'red' : 'yellow'}>{sig.severity}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active suggestion */}
      {swapAlert ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#6B6B88] mb-3">Active Suggestion</p>
          <div className="rounded-2xl p-5 space-y-4 glass" style={{ border: '1px solid rgba(245,158,11,0.25)' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-[#E8E8F0]">{swapAlert.reason}</p>
                <p className="text-sm text-[#8888A4] mt-1">Save ${swapAlert.potentialBenefit.saveMoney} · Save {swapAlert.potentialBenefit.saveTime} minutes</p>
              </div>
              <Badge variant="orange">{swapAlert.urgency} urgency</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <p className="text-xs font-semibold text-red-400 mb-1">CURRENT</p>
                <p className="font-medium text-[#E8E8F0] text-sm">{swapAlert.currentActivity.name}</p>
                <p className="text-xs text-[#8888A4] mt-1">${swapAlert.currentActivity.cost} · {swapAlert.currentActivity.travelTime}min · {swapAlert.currentActivity.crowdLevel}</p>
                <p className="text-xs font-bold text-amber-400 mt-1">{swapAlert.currentActivity.personalMatch}% match</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <p className="text-xs font-semibold text-emerald-400 mb-1">BETTER</p>
                <p className="font-medium text-[#E8E8F0] text-sm">{swapAlert.betterOption.name}</p>
                <p className="text-xs text-[#8888A4] mt-1">${swapAlert.betterOption.cost} · {swapAlert.betterOption.travelTime}min · {swapAlert.betterOption.crowdLevel}</p>
                <p className="text-xs font-bold text-emerald-400 mt-1">{swapAlert.betterOption.personalMatch}% match</p>
              </div>
            </div>
            <button onClick={() => setShowModal(true)} className="btn-brand flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white">
              <Zap className="h-4 w-4" /> Review Full TripSwap Card
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 glass rounded-2xl">
          <Zap className="h-10 w-10 text-[#4B4B60]" />
          <p className="font-semibold text-[#8888A4]">No active swap suggestions</p>
          <p className="text-sm text-[#6B6B88] max-w-sm">TripSwap monitors your plan 24/7 and notifies you the moment a better option appears.</p>
        </div>
      )}

      {showModal && swapAlert && (
        <TripSwapModal alert={swapAlert}
          onAccept={(id) => { acceptSwap(id); setShowModal(false); }}
          onDismiss={() => { dismissSwap(); setShowModal(false); }} />
      )}
    </div>
  );
}
