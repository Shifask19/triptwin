import {
  createContext, useContext, useReducer, useEffect,
  useCallback, type ReactNode,
} from 'react';
import {
  activeTrip as mockTrip,
  activeTripSwapAlert,
  currentTwin as mockTwin,
  currentWeather,
  nowRecommendations,
  intentSearchResults,
  touristTrapData,
  pastTrips,
  upcomingTrips,
} from '../data/mockData';
import type { Trip, TripSwapAlert, TravelTwin, Activity, DayPlan } from '../types';
import { tripsApi, activitiesApi, twinApi, tokenStore } from '../lib/api';

// ─── Normalize twin from API ──────────────────────────────────────────────────
// DB returns snake_case JSONB — merge over mock so every field always exists
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTwin(raw: any): TravelTwin {
  const prefs   = raw.preferences      ?? {};
  const spending = raw.spending_profile ?? {};
  return {
    ...mockTwin,
    userId:         raw.user_id         ?? mockTwin.userId,
    name:           raw.name            ?? mockTwin.name,
    avatar:         raw.avatar          ?? mockTwin.avatar,
    tripsCompleted: Number(raw.trips_completed ?? mockTwin.tripsCompleted),
    twinAccuracy:   Number(raw.twin_accuracy   ?? mockTwin.twinAccuracy),
    preferences: {
      ...mockTwin.preferences,
      ...prefs,
    },
    spendingProfile: {
      avgPerActivity:      Number(spending.avgPerActivity      ?? mockTwin.spendingProfile.avgPerActivity),
      avgPerMeal:          Number(spending.avgPerMeal          ?? mockTwin.spendingProfile.avgPerMeal),
      avgDailyBudget:      Number(spending.avgDailyBudget      ?? mockTwin.spendingProfile.avgDailyBudget),
      spendingConsistency: Number(spending.spendingConsistency ?? mockTwin.spendingProfile.spendingConsistency),
    },
    behaviorHistory: raw.behaviorHistory ?? mockTwin.behaviorHistory,
    travelMemories:  raw.travelMemories  ?? mockTwin.travelMemories,
  };
}

// ─── Normalize trip from API ──────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTrip(raw: any): Trip {
  const budget = typeof raw.budget === 'string' ? JSON.parse(raw.budget) : (raw.budget ?? {});
  const activities: Activity[] = Array.isArray(raw.activities)
    ? raw.activities.filter(Boolean).map((a: any) => ({
        id:                  a.id,
        name:                a.name            ?? '',
        type:                a.type            ?? 'sightseeing',
        category:            a.category        ?? '',
        location:            a.location        ?? '',
        coordinates:         { lat: Number(a.lat ?? 0), lng: Number(a.lng ?? 0) },
        startTime:           a.startTime       ?? a.start_time   ?? '09:00',
        endTime:             a.endTime         ?? a.end_time     ?? '11:00',
        duration:            Number(a.durationMin ?? a.duration_min ?? 60),
        cost:                Number(a.cost ?? 0),
        currency:            a.currency        ?? 'USD',
        rating:              Number(a.rating   ?? 4.0),
        reviewCount:         Number(a.reviewCount ?? a.review_count ?? 0),
        crowdLevel:          (a.crowdLevel ?? a.crowd_level ?? 'medium') as Activity['crowdLevel'],
        weatherSuitability:  (a.weatherSuitability ?? a.weather_suitability ?? 'both') as Activity['weatherSuitability'],
        image:               a.image           ?? '',
        description:         a.description     ?? '',
        personalMatchScore:  Number(a.personalMatchScore ?? a.personal_match_score ?? 0),
        touristTrapScore:    Number(a.touristTrapScore   ?? a.tourist_trap_score   ?? 0),
        status:              (a.status         ?? 'scheduled') as Activity['status'],
      }))
    : [];

  // Group activities by date into DayPlan[]
  const dayMap = new Map<string, Activity[]>();
  for (const act of activities) {
    const date = (act as any).activityDate ?? (act as any).activity_date ?? raw.date_start;
    if (!dayMap.has(date)) dayMap.set(date, []);
    dayMap.get(date)!.push(act);
  }

  const itinerary: DayPlan[] = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, acts], i) => ({
      date,
      dayLabel: `Day ${i + 1} — ${date}`,
      activities: acts,
    }));

  return {
    ...mockTrip,
    id:               raw.id              ?? mockTrip.id,
    name:             raw.name            ?? mockTrip.name,
    destination:      raw.destination     ?? mockTrip.destination,
    country:          raw.country         ?? mockTrip.country,
    coverImage:       raw.cover_image     ?? raw.coverImage ?? mockTrip.coverImage,
    dates: {
      start: raw.date_start ?? raw.dates?.start ?? mockTrip.dates.start,
      end:   raw.date_end   ?? raw.dates?.end   ?? mockTrip.dates.end,
    },
    travelers: Array.isArray(raw.travelers)
      ? raw.travelers.filter(Boolean)
      : mockTrip.travelers,
    status:           (raw.status ?? mockTrip.status) as Trip['status'],
    groupCompatibility: Number(raw.group_compat ?? raw.groupCompatibility ?? mockTrip.groupCompatibility),
    budget: {
      total:         Number(budget.total         ?? mockTrip.budget.total),
      accommodation: Number(budget.accommodation ?? mockTrip.budget.accommodation),
      food:          Number(budget.food          ?? mockTrip.budget.food),
      transport:     Number(budget.transport     ?? mockTrip.budget.transport),
      activities:    Number(budget.activities    ?? mockTrip.budget.activities),
      shopping:      Number(budget.shopping      ?? mockTrip.budget.shopping),
      spent: {
        accommodation: Number(budget.spent?.accommodation ?? mockTrip.budget.spent.accommodation),
        food:          Number(budget.spent?.food          ?? mockTrip.budget.spent.food),
        transport:     Number(budget.spent?.transport     ?? mockTrip.budget.spent.transport),
        activities:    Number(budget.spent?.activities    ?? mockTrip.budget.spent.activities),
        shopping:      Number(budget.spent?.shopping      ?? mockTrip.budget.spent.shopping),
      },
    },
    itinerary: itinerary.length > 0 ? itinerary : mockTrip.itinerary,
  };
}

// ─── State ────────────────────────────────────────────────────────────────────

interface StoreState {
  trip:          Trip;
  twin:          TravelTwin;
  swapAlert:     TripSwapAlert | null;
  swapDismissed: boolean;
  weather:       typeof currentWeather;
  nowRecs:       typeof nowRecommendations;
  searchResults: typeof intentSearchResults;
  trapData:      typeof touristTrapData;
  pastTrips:     typeof pastTrips;
  upcomingTrips: typeof upcomingTrips;
}

const initialState: StoreState = {
  trip:          { ...mockTrip },
  twin:          { ...mockTwin },
  swapAlert:     activeTripSwapAlert,
  swapDismissed: false,
  weather:       currentWeather,
  nowRecs:       nowRecommendations,
  searchResults: intentSearchResults,
  trapData:      touristTrapData,
  pastTrips,
  upcomingTrips,
};

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_TRIP';           trip: Trip }
  | { type: 'SET_TWIN';           twin: TravelTwin }
  | { type: 'ACCEPT_SWAP';        optionId: string }
  | { type: 'DISMISS_SWAP' }
  | { type: 'COMPLETE_ACTIVITY';  activityId: string }
  | { type: 'SKIP_ACTIVITY';      activityId: string };

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {

    case 'SET_TRIP':
      return { ...state, trip: action.trip };

    case 'SET_TWIN':
      return { ...state, twin: action.twin };

    case 'ACCEPT_SWAP': {
      if (!state.swapAlert) return state;
      const alert = state.swapAlert;
      const option =
        alert.betterOption.id === action.optionId
          ? alert.betterOption
          : alert.alternatives.find(a => a.id === action.optionId);
      if (!option) return state;
      return {
        ...state,
        swapAlert:     null,
        swapDismissed: true,
        trip: {
          ...state.trip,
          itinerary: state.trip.itinerary.map((day: DayPlan) => ({
            ...day,
            activities: day.activities.map((act: Activity) =>
              act.id === alert.activityId
                ? {
                    ...act,
                    id:                 option.id,
                    name:               option.name,
                    cost:               option.cost,
                    crowdLevel:         option.crowdLevel         as Activity['crowdLevel'],
                    weatherSuitability: option.weatherSuitability as Activity['weatherSuitability'],
                    personalMatchScore: option.personalMatch,
                    status:             'scheduled' as const,
                    swapAvailable:      false,
                    tripSwapAlert:      undefined,
                  }
                : act
            ),
          })),
        },
      };
    }

    case 'DISMISS_SWAP':
      return { ...state, swapAlert: null, swapDismissed: true };

    case 'COMPLETE_ACTIVITY':
      return {
        ...state,
        trip: {
          ...state.trip,
          itinerary: state.trip.itinerary.map((day: DayPlan) => ({
            ...day,
            activities: day.activities.map((act: Activity) =>
              act.id === action.activityId ? { ...act, status: 'completed' as const } : act
            ),
          })),
        },
      };

    case 'SKIP_ACTIVITY':
      return {
        ...state,
        trip: {
          ...state.trip,
          itinerary: state.trip.itinerary.map((day: DayPlan) => ({
            ...day,
            activities: day.activities.map((act: Activity) =>
              act.id === action.activityId ? { ...act, status: 'skipped' as const } : act
            ),
          })),
        },
      };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface StoreContextValue extends StoreState {
  acceptSwap:       (optionId: string) => void;
  dismissSwap:      () => void;
  completeActivity: (id: string) => void;
  skipActivity:     (id: string) => void;
  subscribe:        () => () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function TripStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const token = tokenStore.get();
    if (!token) return;

    tripsApi.list()
      .then((trips) => {
        const list = trips as Trip[];
        const active = list.find((t: Trip) => t.status === 'active') ?? list[0];
        if (active?.id) return tripsApi.get(active.id);
        return null;
      })
      .then(raw => { if (raw) dispatch({ type: 'SET_TRIP', trip: normalizeTrip(raw) }); })
      .catch(() => {});

    twinApi.get()
      .then(raw => { if (raw) dispatch({ type: 'SET_TWIN', twin: normalizeTwin(raw) }); })
      .catch(() => {});
  }, []);

  const completeActivity = useCallback((activityId: string) => {
    dispatch({ type: 'COMPLETE_ACTIVITY', activityId });
    const token = tokenStore.get();
    if (!token) return;
    const tripId = state.trip.id;
    activitiesApi.update(tripId, activityId, { status: 'completed' }).catch(() => {});
    twinApi.logBehavior({ tripId, activityId, action: 'completed' }).catch(() => {});
  }, [state.trip.id]);

  const skipActivity = useCallback((activityId: string) => {
    dispatch({ type: 'SKIP_ACTIVITY', activityId });
    const token = tokenStore.get();
    if (!token) return;
    const tripId = state.trip.id;
    activitiesApi.update(tripId, activityId, { status: 'skipped' }).catch(() => {});
    twinApi.logBehavior({ tripId, activityId, action: 'skipped' }).catch(() => {});
  }, [state.trip.id]);

  const acceptSwap  = useCallback((optionId: string) => dispatch({ type: 'ACCEPT_SWAP', optionId }), []);
  const dismissSwap = useCallback(() => dispatch({ type: 'DISMISS_SWAP' }), []);
  const subscribe   = useCallback(() => () => {}, []);

  return (
    <StoreContext.Provider value={{
      ...state,
      acceptSwap,
      dismissSwap,
      completeActivity,
      skipActivity,
      subscribe,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTripStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useTripStore must be used inside <TripStoreProvider>');
  return ctx;
}
