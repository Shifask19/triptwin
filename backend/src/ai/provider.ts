/**
 * AI Provider abstraction.
 * Supports OpenAI, Groq (Llama 3), and a deterministic Mock fallback.
 * Switch via AI_PROVIDER env var — no code changes needed.
 */
import OpenAI from 'openai';
import Groq from 'groq-sdk';
import { config } from '../config';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TwinContext {
  name: string;
  budgetLevel: string;
  topInterests: string[];
  crowdTolerance: number;
  hiddenGemsVsLandmarks: number;
  adventureVsRelax: number;
  avgPerActivity: number;
  pastHighlights: string[];
  pastSkipped: string[];
}

export interface AIRecommendation {
  activityName: string;
  reason: string;
  personalMatchScore: number;
  estimatedCost: number;
  crowdLevel: 'low' | 'medium' | 'high';
  bestTimeToVisit: string;
  alternativeSuggestion?: string;
}

export interface AITrapAnalysis {
  trapScore: number;
  verdict: 'great-value' | 'fair' | 'tourist-trap';
  summary: string;
  warnings: string[];
  betterAlternatives: string[];
}

export interface AISearchResult {
  matchScore: number;
  matchReasons: string[];
  suggestedActivities: Array<{ name: string; reason: string; estimatedCost: number }>;
}

export interface AISwapSuggestion {
  shouldSwap: boolean;
  reason: string;
  suggestedActivity: string;
  estimatedSaving: number;
  personalMatchImprovement: number;
}

// ─── System prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  return `You are TripTwin's AI Travel Decision Engine. You help travelers make optimal decisions based on their personal Travel Twin profile. Always respond with valid JSON matching the requested schema. Be concise and data-driven. Consider budget, crowd tolerance, personal interests, and past behavior when making recommendations.`;
}

// ─── OpenAI ───────────────────────────────────────────────────────────────────

async function openAIComplete(prompt: string): Promise<string> {
  const openai = new OpenAI({ apiKey: config.ai.openai.apiKey });
  const res = await openai.chat.completions.create({
    model: config.ai.openai.model,
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 800,
    response_format: { type: 'json_object' },
  });
  return res.choices[0]?.message?.content ?? '{}';
}

// ─── Groq ─────────────────────────────────────────────────────────────────────

async function groqComplete(prompt: string): Promise<string> {
  const groq = new Groq({ apiKey: config.ai.groq.apiKey });
  const res = await groq.chat.completions.create({
    model: config.ai.groq.model,
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 800,
  });
  return res.choices[0]?.message?.content ?? '{}';
}

// ─── Mock (deterministic, no API cost) ───────────────────────────────────────

function mockComplete(prompt: string): string {
  if (prompt.includes('TRAP_ANALYSIS')) {
    return JSON.stringify({
      trapScore: 58, verdict: 'fair',
      summary: 'Popular with tourists but offers a genuine experience.',
      warnings: ['Above-average pricing', 'Long queues at peak hours'],
      betterAlternatives: ['Local neighbourhood market', 'Free city viewpoint nearby'],
    });
  }
  if (prompt.includes('INTENT_SEARCH')) {
    return JSON.stringify({
      matchScore: 91,
      matchReasons: ['Matches quiet atmosphere preference', 'Within your $25 activity budget', 'Low crowd level'],
      suggestedActivities: [
        { name: 'Nezu Shrine', reason: 'Quiet torii tunnel, almost no tourists', estimatedCost: 0 },
        { name: 'Yanaka Ginza', reason: 'Local neighbourhood, authentic atmosphere', estimatedCost: 10 },
        { name: 'Hamarikyu Gardens', reason: 'Peaceful tidal garden surrounded by skyscrapers', estimatedCost: 12 },
      ],
    });
  }
  if (prompt.includes('TRIPSWAP')) {
    return JSON.stringify({
      shouldSwap: true,
      reason: 'Heavy rain and high crowds detected — indoor alternative available nearby.',
      suggestedActivity: 'Nakameguro Canal & Art Galleries',
      estimatedSaving: 12,
      personalMatchImprovement: 22,
    });
  }
  // Default: recommendation
  return JSON.stringify({
    activityName: 'Local Food Market',
    reason: 'Strong match with your food interest (92%) and low crowd tolerance.',
    personalMatchScore: 94,
    estimatedCost: 15,
    crowdLevel: 'low',
    bestTimeToVisit: '08:00 – 11:00',
    alternativeSuggestion: 'Try the neighbourhood side streets after the main market for hidden food stalls.',
  });
}

// ─── Public interface ─────────────────────────────────────────────────────────

async function complete(prompt: string): Promise<string> {
  try {
    switch (config.ai.provider) {
      case 'openai': return await openAIComplete(prompt);
      case 'groq':   return await groqComplete(prompt);
      default:       return mockComplete(prompt);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[AI] ${config.ai.provider} failed (${msg}), falling back to mock`);
    return mockComplete(prompt);
  }
}

function safeParse<T>(raw: string, fallback: T): T {
  try {
    // Extract JSON if wrapped in markdown code blocks
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    return JSON.parse(match ? match[1] : raw) as T;
  } catch {
    return fallback;
  }
}

export const AI = {
  async getRecommendation(twin: TwinContext, context: string): Promise<AIRecommendation> {
    const prompt = `
RECOMMENDATION_REQUEST
Traveler profile: ${JSON.stringify(twin)}
Current context: ${context}
Return JSON: { activityName, reason, personalMatchScore (0-100), estimatedCost, crowdLevel (low|medium|high), bestTimeToVisit, alternativeSuggestion? }`;
    const raw = await complete(prompt);
    return safeParse<AIRecommendation>(raw, {
      activityName: 'Local Experience',
      reason: 'Matches your travel profile',
      personalMatchScore: 80,
      estimatedCost: 20,
      crowdLevel: 'low',
      bestTimeToVisit: 'Morning',
    });
  },

  async analyzeTrap(activity: string, cost: number, rating: number, crowdLevel: string, twin: TwinContext): Promise<AITrapAnalysis> {
    const prompt = `
TRAP_ANALYSIS
Activity: ${activity}, Cost: $${cost}, Rating: ${rating}/5, Crowd: ${crowdLevel}
Traveler budget avg: $${twin.avgPerActivity}, Crowd tolerance: ${twin.crowdTolerance}/100
Return JSON: { trapScore (0-100), verdict (great-value|fair|tourist-trap), summary, warnings[], betterAlternatives[] }`;
    const raw = await complete(prompt);
    return safeParse<AITrapAnalysis>(raw, {
      trapScore: 40, verdict: 'fair',
      summary: 'Moderate value for this traveler.',
      warnings: [], betterAlternatives: [],
    });
  },

  async intentSearch(query: string, twin: TwinContext): Promise<AISearchResult> {
    const prompt = `
INTENT_SEARCH
User intent: "${query}"
Traveler profile: interests=${twin.topInterests.join(',')}, budget=$${twin.avgPerActivity}/activity, crowdTolerance=${twin.crowdTolerance}/100
Return JSON: { matchScore (0-100), matchReasons[], suggestedActivities[{ name, reason, estimatedCost }] }`;
    const raw = await complete(prompt);
    return safeParse<AISearchResult>(raw, {
      matchScore: 80, matchReasons: ['Matches your profile'],
      suggestedActivities: [{ name: 'Local Experience', reason: 'Good match', estimatedCost: 15 }],
    });
  },

  async suggestSwap(currentActivity: string, signals: string[], twin: TwinContext): Promise<AISwapSuggestion> {
    const prompt = `
TRIPSWAP
Current plan: ${currentActivity}
Live signals: ${signals.join(', ')}
Traveler: crowdTolerance=${twin.crowdTolerance}/100, budget=$${twin.avgPerActivity}/activity
Return JSON: { shouldSwap (bool), reason, suggestedActivity, estimatedSaving, personalMatchImprovement }`;
    const raw = await complete(prompt);
    return safeParse<AISwapSuggestion>(raw, {
      shouldSwap: false, reason: 'Current plan looks fine.',
      suggestedActivity: '', estimatedSaving: 0, personalMatchImprovement: 0,
    });
  },
};
