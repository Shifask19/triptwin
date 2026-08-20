# TripTwin — Intelligent Travel Decision Engine

**"Your trip keeps getting smarter while you travel."**

TripTwin is a full-stack production-ready travel application featuring:

- **Travel Twin**: AI-powered personal travel profile that learns from every trip
- **TripSwap**: Real-time plan optimization based on weather, crowds, and live signals
- **Tourist Trap Detector**: Value analysis with better alternatives
- **Smart Search**: Intent-based experience search, not keyword matching
- **Budget Intelligence**: Automated tracking and optimization suggestions
- **Travel Memory**: Historical trip data that improves future recommendations

---

## 🚀 Quick Start (Production)

**Prerequisites:**
- Docker & Docker Compose
- Domain with DNS pointed to your server

**Deploy in 3 commands:**

```bash
# 1. Clone and navigate
git clone <your-repo> triptwin && cd triptwin

# 2. Configure environment
cp .env.production .env
# Edit .env — set POSTGRES_PASSWORD, JWT_SECRET, AI_PROVIDER, GROQ_API_KEY, CORS_ORIGINS

# 3. Start everything
docker-compose up -d
```

**Access:**
- Frontend: `http://your-server-ip` (or your domain)
- API Health: `http://your-server-ip/api/v1/health`

**First login:**
- After stack starts, run migrations and seed demo data:
```bash
docker-compose exec backend node dist/db/migrate.js
docker-compose exec backend node dist/db/seed.js
```
- Demo account: `demo@triptwin.com` / `demo1234`

---

## 🛠️ Development Setup

### Backend (API)

```bash
cd backend

# Install dependencies
npm install

# Start local PostgreSQL + Redis with Docker
docker-compose -f ../docker-compose.dev.yml up -d

# Copy environment file
cp .env.example .env

# Run migrations
npm run db:migrate

# Seed demo data
npm run db:seed

# Start dev server (hot reload)
npm run dev
```

API runs on `http://localhost:4000`

### Frontend (React)

```bash
# From project root
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## 📁 Project Structure

```
triptwin/
├── backend/
│   ├── src/
│   │   ├── ai/          # AI provider abstraction (OpenAI, Groq, Mock)
│   │   ├── cache/       # Redis caching layer
│   │   ├── config/      # Environment config
│   │   ├── db/          # PostgreSQL pool, migrations, seed
│   │   ├── middleware/  # Auth, rate limiting, error handling
│   │   └── routes/      # REST API endpoints
│   ├── Dockerfile       # Multi-stage production image
│   ├── package.json
│   └── tsconfig.json
│
├── src/                 # React frontend
│   ├── components/      # UI primitives + feature components
│   ├── pages/           # Route pages
│   ├── store/           # State management
│   ├── types/           # TypeScript definitions
│   ├── data/            # Mock data (dev fallback)
│   └── lib/             # API client
│
├── nginx/               # Nginx reverse proxy config
├── docker-compose.yml   # Full production stack
├── docker-compose.dev.yml  # Dev services only
├── Dockerfile.frontend  # React build + Nginx
└── .env.production      # Production env template
```

---

## 🌐 API Endpoints

### Auth
- `POST   /api/v1/auth/register` — Create account
- `POST   /api/v1/auth/login` — Login
- `POST   /api/v1/auth/logout` — Logout
- `POST   /api/v1/auth/refresh` — Refresh access token
- `GET    /api/v1/auth/me` — Current user

### Trips
- `GET    /api/v1/trips` — List all trips
- `GET    /api/v1/trips/:id` — Get trip with activities
- `POST   /api/v1/trips` — Create trip
- `PATCH  /api/v1/trips/:id` — Update trip
- `DELETE /api/v1/trips/:id` — Delete trip

### Activities
- `GET    /api/v1/trips/:tripId/activities` — List activities
- `POST   /api/v1/trips/:tripId/activities` — Add activity
- `PATCH  /api/v1/trips/:tripId/activities/:id` — Update activity
- `DELETE /api/v1/trips/:tripId/activities/:id` — Delete activity

### Travel Twin
- `GET    /api/v1/twin` — Get user's Travel Twin profile
- `PATCH  /api/v1/twin/preferences` — Update learned preferences
- `PATCH  /api/v1/twin/spending` — Update spending profile
- `POST   /api/v1/twin/behavior` — Log behavior event
- `GET    /api/v1/twin/behavior` — Get behavior history
- `POST   /api/v1/twin/recommend` — AI recommendation

### AI (Rate Limited)
- `POST   /api/v1/ai/recommend` — Personalized recommendation
- `POST   /api/v1/ai/trap-analysis` — Tourist trap analysis
- `POST   /api/v1/ai/search` — Intent-based search
- `POST   /api/v1/ai/tripswap` — Evaluate swap suggestion
- `POST   /api/v1/ai/what-now` — "What should I do now" recommendations

### Budget
- `GET    /api/v1/trips/:tripId/budget` — Get budget state
- `PATCH  /api/v1/trips/:tripId/budget` — Update budget

### Memory
- `GET    /api/v1/memory` — List travel memories
- `GET    /api/v1/memory/:tripId` — Get memory for trip
- `POST   /api/v1/memory` — Create travel memory

### Health
- `GET    /api/v1/health` — Service health check

---

## 🤖 AI Provider Configuration

TripTwin supports **three AI providers** — switch via `AI_PROVIDER` env var:

### Option 1: Mock (Default — No API Key)
```env
AI_PROVIDER=mock
```
Deterministic rule-based responses. Perfect for development and testing.

### Option 2: Groq (Free Tier Available)
```env
AI_PROVIDER=groq
GROQ_API_KEY=gsk_your_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```
- Get free API key: https://console.groq.com/keys
- Very fast inference with Llama 3
- Generous free tier

### Option 3: OpenAI
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your_key_here
OPENAI_MODEL=gpt-4o-mini
```
- Best quality responses
- Requires paid API key: https://platform.openai.com/api-keys

**Provider fallback:** If the selected provider fails (rate limit, network error), the system automatically falls back to Mock mode.

---

## 📊 Database Schema

**PostgreSQL** with 10 core tables:

- `users` — User accounts
- `travel_twins` — Personal travel profiles
- `trips` — User trips with budget
- `trip_travelers` — Trip participants (group travel)
- `activities` — Planned activities with match scores
- `behavior_events` — User interaction logs (learning data)
- `travel_memories` — Post-trip summaries
- `refresh_tokens` — JWT refresh tokens

**Migrations:** Run automatically in Docker, or manually:
```bash
npm run db:migrate
```

**Seed demo data:**
```bash
npm run db:seed
```

---

## 🔒 Security

- **JWT authentication** with access + refresh tokens
- **bcrypt** password hashing (cost factor 12)
- **Helmet.js** security headers
- **Rate limiting**: 200 req/15min general, 30 req/15min for AI endpoints
- **CORS** with explicit origin whitelist
- **SQL injection protection** via parameterized queries
- **Non-root Docker user** for production
- **Environment secrets** never committed to Git

---

## 🌍 Deployment Options

### Option 1: Docker Compose (Recommended)

Single command deployment with PostgreSQL, Redis, Backend, and Frontend all orchestrated.

```bash
docker-compose up -d
```

Ideal for: VPS (DigitalOcean, Linode, Hetzner), self-hosted servers.

### Option 2: Railway

1. Push to GitHub
2. Connect Railway to your repo
3. Add PostgreSQL + Redis add-ons
4. Set environment variables in Railway dashboard
5. Deploy backend and frontend as separate services

### Option 3: Render

1. Create two web services:
   - Backend: Docker build from `backend/Dockerfile`
   - Frontend: Static site from `npm run build`
2. Add PostgreSQL + Redis databases
3. Set env vars in Render dashboard

### Option 4: Vercel (Frontend) + Railway (Backend)

- Frontend: Deploy to Vercel (auto-detects Vite)
- Backend: Deploy to Railway as Docker service
- Connect via CORS and API URL

---

## ⚙️ Scaling for High Traffic

The stack is designed to handle production load out of the box:

### Backend Scaling

**Clustering** — Node.js clustered mode spawns 1 worker per CPU core:
```bash
npm run start:cluster
```
Docker uses this by default (`CMD ["node", "dist/cluster.js"]`).

**Horizontal scaling** — Run multiple backend containers behind a load balancer:
```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      replicas: 4  # 4 backend instances
```

**Database connection pooling** — Max 20 concurrent connections per worker (configurable via `DB_POOL_MAX`).

**Redis caching** — Frequently-hit endpoints cached (trips, activities, twin profile). TTL: 60–300s.

### Frontend Scaling

**CDN** — Serve static assets (JS/CSS/images) via CDN (Cloudflare, AWS CloudFront).

**Nginx caching** — Static assets cached for 1 year (`Cache-Control: public, immutable`).

**Gzip compression** — Reduces payload size by ~70%.

### Database Optimization

**Indexes** — All foreign keys and commonly queried fields indexed.

**Read replicas** — For extreme scale, add PostgreSQL read replicas and route read-only queries there.

### Monitoring

Add to `docker-compose.yml`:
- **Prometheus + Grafana** for metrics
- **Loki** for log aggregation
- **Sentry** for error tracking (add SDK to frontend + backend)

---

## 🧪 Testing

```bash
# Backend unit tests (add Jest/Vitest)
cd backend && npm test

# Frontend tests
npm test

# E2E tests (add Playwright/Cypress)
npm run test:e2e
```

---

## 📝 Environment Variables

### Backend (.env)

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | Environment | `development` |
| `PORT` | API port | `4000` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection string | - |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | - |
| `JWT_EXPIRES_IN` | Access token expiry | `7d` |
| `AI_PROVIDER` | AI provider (`openai` \| `groq` \| `mock`) | `mock` |
| `OPENAI_API_KEY` | OpenAI API key | - |
| `GROQ_API_KEY` | Groq API key | - |
| `CORS_ORIGINS` | Allowed origins (comma-separated) | `http://localhost:5173` |
| `RATE_LIMIT_MAX` | Max requests per window | `200` |
| `AI_RATE_LIMIT_MAX` | Max AI requests per window | `30` |

### Frontend (.env)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `/api/v1` (proxied by Nginx) |

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — feel free to use in commercial projects.

---

## 🙋 Support

- **Issues**: Open a GitHub issue
- **Docs**: See `/docs` folder for architecture details
- **Email**: support@triptwin.com (placeholder)

---

**Built with ❤️ for travelers who want their trips to keep getting smarter.**
