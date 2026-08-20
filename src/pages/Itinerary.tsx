import { useState } from 'react';
import { Clock, MapPin, Star, CheckCircle, Zap, AlertTriangle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useTripStore } from '../store/useTripStore';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ScoreRing } from '../components/ui/ScoreRing';
import { TripSwapModal } from '../components/TripSwapModal';
import type { Activity } from '../types';

const crowdConfig = {
  low:    { dot: 'bg-emerald-500', label: 'Low crowds' },
  medium: { dot: 'bg-amber-500',   label: 'Moderate' },
  high:   { dot: 'bg-red-500',     label: 'High crowds' },
};

function ActivityRow({
  activity,
  onComplete,
  onSkip,
  onSwapClick,
}: {
  activity: Activity;
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
  onSwapClick: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const crowd = crowdConfig[activity.crowdLevel];
  const isDone    = activity.status === 'completed';
  const isSkipped = activity.status === 'skipped';
  const isInactive = isDone || isSkipped;

  return (
    <div className={`relative rounded-2xl border transition-all ${
      isInactive        ? 'border-gray-100 bg-gray-50 opacity-60'
      : activity.swapAvailable ? 'border-amber-300 bg-amber-50/30 shadow-sm'
      : 'border-gray-100 bg-white hover:border-indigo-200 hover:shadow-sm'
    }`}>
      {/* Swap badge */}
      {activity.swapAvailable && !isInactive && (
        <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 shadow-md z-10">
          <Zap className="h-3 w-3 text-white" />
        </div>
      )}

      {/* Header row — always visible, clickable to expand */}
      <button
        type="button"
        className="flex w-full cursor-pointer items-center gap-3 p-3 text-left"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
      >
        <img
          src={activity.image}
          alt={activity.name}
          className={`h-16 w-16 flex-shrink-0 rounded-xl object-cover ${isInactive ? 'grayscale' : ''}`}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
            <p className={`font-semibold text-sm ${isDone ? 'text-gray-400 line-through' : isSkipped ? 'text-gray-400' : 'text-gray-900'}`}>
              {activity.name}
            </p>
            <Badge
              variant={isDone ? 'green' : isSkipped ? 'gray' : activity.status === 'swapped' ? 'purple' : 'blue'}
              size="sm"
            >
              {activity.status}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
            <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{activity.startTime} – {activity.endTime}</span>
            <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{activity.location}</span>
            <span className="flex items-center gap-0.5">
              <span className={`h-2 w-2 rounded-full ${crowd.dot}`} />{crowd.label}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-xs font-medium text-gray-700">{activity.cost === 0 ? 'Free' : `$${activity.cost}`}</span>
            <span className="flex items-center gap-0.5 text-xs text-amber-500">
              <Star className="h-3 w-3 fill-current" />{activity.rating}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <ScoreRing score={activity.personalMatchScore} size="sm" label="match" />
          {expanded
            ? <ChevronUp className="h-4 w-4 text-gray-300" />
            : <ChevronDown className="h-4 w-4 text-gray-300" />}
        </div>
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-3">
          <p className="text-sm text-gray-600 leading-relaxed">{activity.description}</p>

          <div className="flex flex-wrap gap-2">
            <Badge variant={activity.weatherSuitability === 'indoor' ? 'blue' : 'yellow'}>
              {activity.weatherSuitability === 'indoor' ? '🏛️ Indoor' : activity.weatherSuitability === 'outdoor' ? '🌤️ Outdoor' : '🌥️ Either'}
            </Badge>
            <Badge variant={activity.touristTrapScore > 60 ? 'red' : activity.touristTrapScore > 30 ? 'yellow' : 'green'}>
              Trap score: {activity.touristTrapScore}/100
            </Badge>
          </div>

          {/* Action buttons */}
          {!isInactive && (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" variant="success" onClick={() => { onComplete(activity.id); setExpanded(false); }}>
                <CheckCircle className="h-3.5 w-3.5" /> Mark Done
              </Button>
              <Button size="sm" variant="secondary" onClick={() => { onSkip(activity.id); setExpanded(false); }}>
                <XCircle className="h-3.5 w-3.5" /> Skip
              </Button>
              {activity.swapAvailable && (
                <Button size="sm" variant="primary" onClick={onSwapClick}>
                  <Zap className="h-3.5 w-3.5" /> View TripSwap
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Itinerary() {
  const store = useTripStore();
  const { trip, swapAlert, acceptSwap, dismissSwap, completeActivity, skipActivity } = store;
  const [showSwapModal, setShowSwapModal] = useState(false);

  const totalActivities = trip.itinerary.flatMap(d => d.activities).length;
  const doneActivities  = trip.itinerary.flatMap(d => d.activities).filter(a => a.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{trip.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {trip.destination} · {trip.dates.start} → {trip.dates.end} ·{' '}
          <span className="text-indigo-600 font-medium">{doneActivities}/{totalActivities} done</span> ·{' '}
          <span className="text-indigo-600 font-medium">Living itinerary — adapts in real time</span>
        </p>
      </div>

      {/* TripSwap banner */}
      {swapAlert && (
        <button
          type="button"
          onClick={() => setShowSwapModal(true)}
          className="flex w-full items-center gap-3 rounded-2xl border-2 border-amber-400 bg-amber-50 px-4 py-3 text-left hover:bg-amber-100 transition-colors"
        >
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-amber-800 text-sm">TripSwap Alert — Better option available</p>
            <p className="text-xs text-amber-700">{swapAlert.reason}</p>
          </div>
          <span className="text-xs text-amber-600 font-medium flex-shrink-0">Review →</span>
        </button>
      )}

      {/* Day-by-day itinerary */}
      {trip.itinerary.map(day => (
        <div key={day.date}>
          <div className="mb-3 flex items-center gap-3">
            <h2 className="font-semibold text-gray-800">{day.dayLabel}</h2>
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-xs text-gray-400">{day.activities.length} activities</span>
          </div>
          <div className="space-y-3">
            {day.activities.map(act => (
              <ActivityRow
                key={act.id}
                activity={act}
                onComplete={completeActivity}
                onSkip={skipActivity}
                onSwapClick={() => setShowSwapModal(true)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* TripSwap modal */}
      {showSwapModal && swapAlert && (
        <TripSwapModal
          alert={swapAlert}
          onAccept={(id) => { acceptSwap(id); setShowSwapModal(false); }}
          onDismiss={() => { dismissSwap(); setShowSwapModal(false); }}
        />
      )}
    </div>
  );
}
