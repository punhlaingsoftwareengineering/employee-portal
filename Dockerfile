FROM denoland/deno:2.8.3 AS builder

WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json deno.lock .npmrc ./
RUN deno install --allow-scripts

# Copy application source
COPY . .

# SvelteKit validates env at build time — placeholders only; runtime uses --env-file
ARG BUILD_DATABASE_URL="postgres://postgres:postgres@db:5432/employee_portal"
ARG BUILD_ORIGIN="http://localhost:1027"
ARG BUILD_KIT_DUMMY_VALUE="docker-build-placeholder-min-32-chars"

# Build SvelteKit (adapter-node → build/)
RUN DATABASE_URL="$BUILD_DATABASE_URL" \
	ORIGIN="$BUILD_ORIGIN" \
	BETTER_AUTH_SECRET="$BUILD_KIT_DUMMY_VALUE" \
	deno task build

FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=1027

# adapter-node runtime needs build output, kit adapter bundle, and node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/.svelte-kit ./.svelte-kit
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 1027

CMD ["node", "build/index.js"]
