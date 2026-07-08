# ---------- Build stage ----------
FROM node:24-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY . .

# SvelteKit validates env at build time — placeholders only; runtime uses env_file / secrets
ARG BUILD_DATABASE_URL="postgres://postgres:postgres@db:5432/employee_portal"
ARG BUILD_ORIGIN="http://localhost:1027"
ARG BUILD_KIT_DUMMY_VALUE="docker-build-placeholder-min-32-chars"

ENV BUILDING=true
RUN DATABASE_URL="$BUILD_DATABASE_URL" \
	ORIGIN="$BUILD_ORIGIN" \
	BETTER_AUTH_SECRET="$BUILD_KIT_DUMMY_VALUE" \
	pnpm build

RUN pnpm prune --prod

# ---------- Runtime stage ----------
FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=production \
	HOST=0.0.0.0 \
	PORT=1027

COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 1027

CMD ["node", "build/index.js"]
