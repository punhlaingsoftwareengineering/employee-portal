FROM denoland/deno:2.8.3 AS builder

WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json deno.lock .npmrc ./
RUN deno install --allow-scripts

# Copy application source
COPY . .

# SvelteKit validates env at build time — required vars only; optional vars use schema in src/env.ts
ENV DATABASE_URL="postgres://postgres:postgres@db:5432/employee_portal"
ENV ORIGIN="http://localhost:1027"
ENV BETTER_AUTH_SECRET="docker-build-placeholder-min-32-chars"

# Build SvelteKit (adapter-node → build/)
RUN deno task build

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
