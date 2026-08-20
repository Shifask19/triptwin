# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --include=dev

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

RUN npm prune --omit=dev

# ─── Stage 2: Production image ───────────────────────────────────────────────
FROM node:22-alpine AS production

RUN addgroup -g 1001 -S nodejs && \
    adduser  -S triptwin -u 1001 -G nodejs

WORKDIR /app

COPY --from=builder --chown=triptwin:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=triptwin:nodejs /app/dist        ./dist
COPY --from=builder --chown=triptwin:nodejs /app/package.json ./

USER triptwin

# Railway injects PORT dynamically — expose default but app reads process.env.PORT
EXPOSE 4000

CMD ["node", "dist/cluster.js"]
