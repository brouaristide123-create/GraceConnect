# ── Stage 1: Build frontend ───────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package.json package-lock.json* ./
# Force install ALL deps (including devDeps like typescript/vite) regardless of NODE_ENV
RUN NODE_ENV=development npm install --include=dev
COPY . .
RUN npm run build

# ── Stage 2: Backend + serve frontend ─────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Copy backend
COPY backend/package.json backend/package-lock.json* ./backend/
RUN cd backend && npm install --production 2>/dev/null || npm install --production

COPY backend/ ./backend/

# Generate Prisma client
RUN cd backend && npx prisma generate

# Copy built frontend
COPY --from=frontend-builder /app/dist ./backend/public

EXPOSE 4000

CMD sh -c "cd backend && npx prisma migrate deploy && node seed.js && node server.js"
