# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and install ALL deps (including devDeps for tsc)
COPY package*.json ./
RUN npm ci --include=dev

# Copy source and compile TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Prune dev dependencies
RUN npm prune --omit=dev

# ─── Stage 2: Production image ───────────────────────────────────────────────
FROM node:22-alpine AS production

# Security: run as non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser  -S triptwin -u 1001 -G nodejs

WORKDIR /app

# Copy only production artifacts
COPY --from=builder --chown=triptwin:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=triptwin:nodejs /app/dist        ./dist
COPY --from=builder --chown=triptwin:nodejs /app/package.json ./

USER triptwin

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:4000/api/v1/health || exit 1

# Use cluster mode in production for max throughput
CMD ["node", "dist/cluster.js"]
