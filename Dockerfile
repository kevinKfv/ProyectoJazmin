# ==========================================
# Dockerfile multi-etapa optimizado para Next.js 16 + Prisma
# Compatible con Docker local, Render y Cloud
# ==========================================

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# 1. Dependencias
FROM base AS deps
COPY package.json package-lock.json* .npmrc* ./
COPY prisma ./prisma/
RUN npm install --legacy-peer-deps

# 2. Compilación
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_STANDALONE=true

RUN npx prisma generate
RUN npm run build

# 3. Imagen final de ejecución
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push --skip-generate && node scripts/init-db.js && node server.js"]
