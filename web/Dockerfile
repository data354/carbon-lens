# syntax=docker/dockerfile:1


# =====================================
# Stage 0: Build base
# =====================================
FROM oven/bun:1.2.17-alpine AS base

WORKDIR /app

RUN apk update && apk upgrade --no-cache \
    && apk add --no-cache openssl

# =====================================
# Stage 1: Dependencies installation
# =====================================
FROM base AS deps

COPY package.json bun.lock* ./

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# =====================================
# Stage 2: Prisma generation
# =====================================
FROM base AS prisma

ENV PRISMA_GENERATE_SKIP_AUTOINSTALL=1

COPY --from=deps /app/package.json /app/bun.lock* ./
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma

RUN bun x prisma generate

# =====================================
# Stage 3: Builder
# =====================================
FROM base AS builder

ARG API_URL=http://localhost:8080
ARG APP_URL=http://localhost:3000

ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=1
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_GEO_API_BASE_URL=$API_URL
ENV NEXT_PUBLIC_BETTER_AUTH_URL=$APP_URL
ENV NEXT_PUBLIC_APP_URL=$APP_URL

COPY --from=prisma /app/node_modules ./node_modules
COPY --from=prisma /app/src/generated/prisma ./src/generated/prisma
COPY . .

RUN bun run build

# =====================================
# Stage 4: Runtime
# =====================================
FROM base AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN adduser \
    --disabled-password \
    --gecos "" \
    --uid 10001 \
    --no-create-home \
    --shell /sbin/nologin \
    nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN chown -R nextjs:nextjs /app

USER nextjs

EXPOSE 3000

CMD ["bun", "server.js"]