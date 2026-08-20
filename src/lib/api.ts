/**
 * Typed API client
 * - In Docker (local): calls /api/v1 → proxied by Nginx to backend:4000
 * - In Railway/production: calls VITE_API_URL directly (set to backend Railway URL)
 * - In Vite dev: calls /api/v1 → proxied by Vite to localhost:4000
 */

// VITE_API_URL is injected at build time
// Docker local:   /api/v1  (Nginx proxies it)
// Railway prod:   https://triptwin-backend.railway.app/api/v1
const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api/v1';

// ─── Token management ─────────────────────────────────────────────────────────
export const tokenStore = {
  get:        ()    : string | null => localStorage.getItem('tt_access'),
  set:        (t: string)           => localStorage.setItem('tt_access', t),
  clear:      ()                    => { localStorage.removeItem('tt_access'); localStorage.removeItem('tt_refresh'); },
  getRefresh: ()    : string | null => localStorage.getItem('tt_refresh'),
  setRefresh: (t: string)           => localStorage.setItem('tt_refresh', t),
};

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function request<T>(method: string, path: string, body?: unknown, retry = true): Promise<T> {
  const token = tokenStore.get();

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // Auto-refresh on 401 TOKEN_EXPIRED
  if (res.status === 401 && retry) {
    const err = await res.clone().json().catch(() => ({})) as { code?: string };
    if (err.code === 'TOKEN_EXPIRED') {
      const refreshed = await refreshTokens();
      if (refreshed) return request<T>(method, path, body, false);
    }
    tokenStore.clear();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` })) as { error: string };
    throw new Error(errBody.error ?? `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

async function refreshTokens(): Promise<boolean> {
  const refresh = tokenStore.getRefresh();
  if (!refresh) return false;
  try {
    const data = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh }),
    }).then(r => r.json()) as { accessToken?: string; refreshToken?: string };
    if (data.accessToken) {
      tokenStore.set(data.accessToken);
      if (data.refreshToken) tokenStore.setRefresh(data.refreshToken);
      return true;
    }
  } catch { /* silent */ }
  return false;
}

const get   = <T>(path: string)                 => request<T>('GET',    path);
const post  = <T>(path: string, body?: unknown) => request<T>('POST',   path, body);
const patch = <T>(path: string, body?: unknown) => request<T>('PATCH',  path, body);
const del   = <T>(path: string)                 => request<T>('DELETE', path);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthUser { id: string; email: string; name: string; avatar?: string }
export interface AuthResponse { user: AuthUser; accessToken: string; refreshToken: string }

export const authApi = {
  register: (email: string, password: string, name: string) => post<AuthResponse>('/auth/register', { email, password, name }),
  login:    (email: string, password: string)               => post<AuthResponse>('/auth/login',    { email, password }),
  logout:   (refreshToken: string)                          => post('/auth/logout', { refreshToken }),
  me:       ()                                              => get<AuthUser>('/auth/me'),
};

// ─── Trips ────────────────────────────────────────────────────────────────────
export const tripsApi = {
  list:   ()                       => get<unknown[]>('/trips'),
  get:    (id: string)             => get<unknown>(`/trips/${id}`),
  create: (data: unknown)          => post<{ id: string }>('/trips', data),
  update: (id: string, d: unknown) => patch(`/trips/${id}`, d),
  delete: (id: string)             => del(`/trips/${id}`),
};

// ─── Activities ───────────────────────────────────────────────────────────────
export const activitiesApi = {
  list:   (tripId: string)                           => get<unknown[]>(`/trips/${tripId}/activities`),
  create: (tripId: string, data: unknown)            => post<{ id: string }>(`/trips/${tripId}/activities`, data),
  update: (tripId: string, actId: string, d: unknown)=> patch(`/trips/${tripId}/activities/${actId}`, d),
  delete: (tripId: string, actId: string)            => del(`/trips/${tripId}/activities/${actId}`),
};

// ─── Travel Twin ──────────────────────────────────────────────────────────────
export const twinApi = {
  get:            ()              => get<unknown>('/twin'),
  updatePrefs:    (p: unknown)    => patch('/twin/preferences', p),
  updateSpending: (d: unknown)    => patch('/twin/spending', d),
  logBehavior:    (d: unknown)    => post('/twin/behavior', d),
  getBehavior:    ()              => get<unknown[]>('/twin/behavior'),
  recommend:      (context: string) => post<unknown>('/twin/recommend', { context }),
};

// ─── Budget ───────────────────────────────────────────────────────────────────
export const budgetApi = {
  get:    (tripId: string)            => get<unknown>(`/trips/${tripId}/budget`),
  update: (tripId: string, d: unknown)=> patch(`/trips/${tripId}/budget`, d),
};

// ─── Memory ───────────────────────────────────────────────────────────────────
export const memoryApi = {
  list:   ()              => get<unknown[]>('/memory'),
  get:    (tripId: string)=> get<unknown>(`/memory/${tripId}`),
  create: (d: unknown)    => post<{ id: string }>('/memory', d),
};

// ─── AI ───────────────────────────────────────────────────────────────────────
export const aiApi = {
  recommend:    (context: string)                                                => post<unknown>('/ai/recommend', { context }),
  trapAnalysis: (activityName: string, cost: number, rating?: number, crowd?: string) => post<unknown>('/ai/trap-analysis', { activityName, cost, rating, crowdLevel: crowd }),
  search:       (query: string)                                                  => post<unknown>('/ai/search', { query }),
  tripSwap:     (activityId: string, signals: string[])                         => post<unknown>('/ai/tripswap', { activityId, signals }),
  whatNow:      (d: { availableMinutes: number; currentLocation?: string; weather?: string; budget?: number }) => post<unknown>('/ai/what-now', d),
};

// ─── Health ───────────────────────────────────────────────────────────────────
export const healthApi = {
  check: () => get<{ status: string; services: Record<string, string> }>('/health'),
};
