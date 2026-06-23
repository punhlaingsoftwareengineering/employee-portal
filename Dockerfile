FROM denoland/deno:2.8.3

WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json deno.lock .npmrc ./
RUN deno install --allow-scripts

# Copy application source
COPY . .

# SvelteKit validates env at build time — placeholders are overridden at runtime


# Build SvelteKit (adapter-node → build/)
RUN deno task build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=1027

EXPOSE 1027

CMD ["deno", "task", "start"]
