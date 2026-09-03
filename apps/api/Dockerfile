# syntax=docker/dockerfile:1
# Contexto de build = raíz del repo (monorepo pnpm) — ver apps/api/railway.json.

FROM node:22-bookworm-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate
WORKDIR /app

# Puppeteer solo se usa para PDFs; el Chromium real se instala vía apt en la
# imagen final. No descargar el binario de Chromium propio en el build.
ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter @comedor-solanus/api prisma:generate
RUN pnpm --filter @comedor-solanus/api build

FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
      chromium openssl ca-certificates fonts-liberation \
    && rm -rf /var/lib/apt/lists/*
# pnpm también en runtime: el preDeployCommand de railway.json (prisma migrate
# deploy) corre dentro de esta imagen, no en la de build.
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=production
WORKDIR /app
COPY --from=build /app /app

EXPOSE 3210
CMD ["node", "apps/api/dist/src/main.js"]
