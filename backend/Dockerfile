FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev
COPY tsconfig.json ./
COPY src ./src
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-alpine AS production
RUN addgroup -g 1001 -S nodejs && adduser -S triptwin -u 1001 -G nodejs
WORKDIR /app
COPY --from=builder --chown=triptwin:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=triptwin:nodejs /app/dist        ./dist
COPY --from=builder --chown=triptwin:nodejs /app/package.json ./
USER triptwin
EXPOSE 4000
# Use single server process — runs migrations + seed automatically on first start
CMD ["node", "dist/server.js"]
