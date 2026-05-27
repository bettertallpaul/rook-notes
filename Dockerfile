# --- Stage 1: Build stage ---
FROM node:24-bookworm-slim AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# --- Stage 2: Runner stage ---
FROM nginx:alpine

# Nginx alpine image has a default template mechanism under /etc/nginx/templates/
# files ending in .template will be processed with envsubst and saved to /etc/nginx/conf.d/
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Copy the built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Default environment variables for Nginx template interpolation at startup
ENV PORT=80
ENV API_URL=http://localhost:3001
ENV NGINX_ENVSUBST_FILTER="^(PORT|API_URL)$"

EXPOSE 80

# The base nginx image will automatically start nginx
