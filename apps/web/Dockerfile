FROM oven/bun:1.3.14-alpine AS base

WORKDIR /app

# =====================================
# Stage 1: Dependencies
# =====================================
FROM base AS deps

COPY package.json bun.lock bunfig.toml ./
COPY apps/web/package.json apps/web/package.json

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --filter '@carbon-lens/web'

# =====================================
# Stage 2: Build
# =====================================
FROM base AS builder

RUN apk add --no-cache openssl

ARG API_URL=http://localhost:8080
ARG APP_URL=http://localhost:3000

ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=1
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_GEO_API_BASE_URL=$API_URL
ENV NEXT_PUBLIC_BETTER_AUTH_URL=$APP_URL
ENV NEXT_PUBLIC_APP_URL=$APP_URL

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json /app/bun.lock /app/bunfig.toml ./
COPY --from=deps /app/apps/web/package.json ./apps/web/package.json
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

COPY apps/web/prisma ./apps/web/prisma
COPY apps/web/public ./apps/web/public
COPY apps/web/next.config.ts ./apps/web/next.config.ts
COPY apps/web/next-env.d.ts ./apps/web/next-env.d.ts
COPY apps/web/postcss.config.mjs ./apps/web/postcss.config.mjs
COPY apps/web/tsconfig.json ./apps/web/tsconfig.json
COPY apps/web/src ./apps/web/src

WORKDIR /app/apps/web

RUN bun x prisma generate

RUN bun run build

# =====================================
# Stage 3: Runner
# =====================================
FROM oven/bun:1.3.14-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup \
    --system \
    --gid 10001 \
    nextjs \
    && adduser \
      --system \
      --disabled-password \
      --gecos "" \
      --uid 10001 \
      --no-create-home \
      --shell /sbin/nologin \
      nextjs

COPY --from=builder --chown=nextjs:nextjs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nextjs /app/apps/web/public ./apps/web/public

RUN chown nextjs:nextjs /app

USER nextjs

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["bun", "server.js"]