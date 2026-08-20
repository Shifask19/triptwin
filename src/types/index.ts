// ─── Core Domain Types ────────────────────────────────────────────────────────

export interface TravelTwin {
  userId: string;
  name: string;
  avatar: string;
  tripsCompleted: number;
  twinAccuracy: number; // 0-100%

  // Learned preferences (0-100 affinity score)
  preferences: {
    budgetLevel: 'budget' | 'mid-range' | 'luxury';
    luxuryVsBudget: number; // 0=budget, 100=luxury
    adventureVsRelax: number; // 0=relax, 100=adventure
    natureVsCity: number; // 0=city, 100=nature
    museumInterest: number;
    foodInterest: number;
    shoppingInterest: number;
    photographyInterest: number;
    nightlifeInterest: number;
    walkingTolerance: number;
    crowdTolerance: number;
    hiddenGemsVsLandmarks: number; // 0=landmarks, 100=hidden
    pace: 'slow' | 'moderate' | 'fast';
    travelStyle: 'solo' | 'couple' | 'family' | 'group';
    vegetarian: boolean;
    preferredTransport: string[];
    preferredTravelTime: 'morning' | 'afternoon' | 'flexible';
  };

  spendingProfile: {
    avgPerActivity: number;
    avgPerMeal: number;
    avgDailyBudget: number;
    spendingConsistency: number; // how closely they follow budget
  };

  behaviorHistory: BehaviorEvent[];
  travelMemories: TravelMemory[];
}

export interface BehaviorEvent {
  tripId: string;
  activityId: string;
  action: 'completed' | 'skipped' | 'swapped' | 'rated';
  rating?: number;
  timestamp: string;
  notes?: string;
}

export interface TravelMemory {
  tripId: string;
  destination: string;
  dates: { start: string; end: string };
  highlights: string[];
  skipped: string[];
  totalSpend: number;
  budgetedSpend: number;
  satisfactionScore: number;
  photos: number;
}

// ─── Trip & Itinerary ─────────────────────────────────────────────────────────

export interface Trip {
  id: string;
  name: string;
  destination: string;
  country: string;
  coverImage: string;
  dates: { start: string; end: string };
  travelers: Traveler[];
  budget: Budget;
  status: 'planning' | 'active' | 'completed';
  itinerary: DayPlan[];
  groupCompatibility?: number;
}

export interface Traveler {
  id: string;
  name: string;
  avatar: string;
  twin?: TravelTwin;
}

export interface Budget {
  total: number;
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  shopping: number;
  spent: {
    accommodation: number;
    food: number;
    transport: number;
    activities: number;
    shopping: number;
  };
}

export interface DayPlan {
  date: string;
  dayLabel: string;
  activities: Activity[];
}

export interface Activity {
  id: string;
  name: string;
  type: ActivityType;
  category: string;
  location: string;
  coordinates: { lat: number; lng: number };
  startTime: string;
  endTime: string;
  duration: number; // minutes
  cost: number;
  currency: string;
  rating: number;
  reviewCount: number;
  crowdLevel: 'low' | 'medium' | 'high';
  weatherSuitability: 'indoor' | 'outdoor' | 'both';
  image: string;
  description: string;
  personalMatchScore: number;
  touristTrapScore: number;
  status: 'scheduled' | 'completed' | 'skipped' | 'swapped';
  swapAvailable?: boolean;
  tripSwapAlert?: TripSwapAlert;
}

export type ActivityType =
  | 'sightseeing'
  | 'museum'
  | 'food'
  | 'shopping'
  | 'nature'
  | 'adventure'
  | 'culture'
  | 'nightlife'
  | 'transport'
  | 'accommodation';

// ─── TripSwap ─────────────────────────────────────────────────────────────────

export interface TripSwapAlert {
  id: string;
  activityId: string;
  reason: string;
  signals: SwapSignal[];
  currentActivity: ActivitySnapshot;
  betterOption: ActivitySnapshot;
  alternatives: ActivitySnapshot[];
  potentialBenefit: {
    saveMoney: number;
    saveTime: number;
    weatherImprovement: boolean;
    crowdReduction: boolean;
  };
  urgency: 'low' | 'medium' | 'high';
  expiresAt: string;
}

export interface SwapSignal {
  type: 'weather' | 'crowd' | 'closure' | 'price' | 'time' | 'traffic';
  label: string;
  severity: 'info' | 'warning' | 'critical';
  value: string;
}

export interface ActivitySnapshot {
  id: string;
  name: string;
  cost: number;
  crowdLevel: 'low' | 'medium' | 'high';
  weatherSuitability: string;
  travelTime: number;
  personalMatch: number;
  image: string;
  type: string;
}

// ─── Tourist Trap Detector ────────────────────────────────────────────────────

export interface TouristTrapAnalysis {
  activityId: string;
  score: number; // 0-100, higher = more trap-like
  verdict: 'great-value' | 'fair' | 'tourist-trap';
  warnings: string[];
  comparisons: TrapComparison[];
}

export interface TrapComparison {
  label: 'Most Iconic' | 'Best Value' | 'Least Crowded' | 'Hidden Gem';
  name: string;
  cost: number;
  rating: number;
  crowdLevel: 'low' | 'medium' | 'high';
  image: string;
  personalMatch: number;
}

// ─── What Should I Do Now ─────────────────────────────────────────────────────

export interface NowRecommendation {
  type: 'best-match' | 'best-value' | 'hidden-gem';
  activity: Activity;
  reason: string;
  availableTime: number; // minutes user has
  distanceMinutes: number;
}

// ─── Weather & Live Conditions ────────────────────────────────────────────────

export interface WeatherCondition {
  current: {
    temp: number;
    condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'windy' | 'foggy';
    label: string;
    icon: string;
    humidity: number;
    feelsLike: number;
  };
  hourly: HourlyWeather[];
  sunset: string;
  sunrise: string;
}

export interface HourlyWeather {
  hour: string;
  temp: number;
  condition: string;
  rainChance: number;
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface SearchResult {
  activity: Activity;
  intentMatch: number; // how well it matches the search intent
  matchReasons: string[];
}
