FROM denoland/deno:2.8.3

WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json deno.lock .npmrc ./
RUN deno install --allow-scripts

# Copy application source
COPY . .

# SvelteKit validates env at build time — placeholders are overridden at runtime
ENV DATABASE_URL="postgres://postgres:postgres@db:5432/employee_portal"
ENV ORIGIN="http://localhost:1027"
ENV BETTER_AUTH_SECRET="docker-build-placeholder-minimum-32-chars"
ENV GITHUB_CLIENT_ID="unused"
ENV GITHUB_CLIENT_SECRET="unused"
ENV SMTP_HOST="unused"
ENV SMTP_PORT="587"
ENV SMTP_USER="unused"
ENV SMTP_PASS="unused"
ENV SMTP_FROM="unused@localhost"
ENV AUTH_SESSION_EXPIRES_IN="7d"
ENV AUTH_SESSION_UPDATE_AGE="1d"
ENV AUTH_SESSION_COOKIE_CACHE_ENABLED="true"
ENV AUTH_SESSION_COOKIE_CACHE_MAX_AGE="5m"

# Build SvelteKit (adapter-node → build/)
RUN deno task build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=1027

EXPOSE 1027

CMD ["deno", "task", "start"]
