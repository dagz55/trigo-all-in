# Stage 1: Build the Next.js application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install necessary packages for native dependencies (if any)
# RUN apk add --no-cache libc6-compat
# RUN apk update && apk add --no-cache python3 make g++

# Copy package.json and lock files
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# Install dependencies based on the lock file found
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm install --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# --- Stage 2: Production image ---
FROM node:18-alpine AS runner

WORKDIR /app

# Install necessary packages for production (if any)
# RUN apk add --no-cache libc6-compat
# RUN apk add --no-cache openssl

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/public ./public

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create non-root user and group
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

USER nextjs

EXPOSE 3000

ENV PORT 3000

# Start the Next.js application
CMD ["node", "server.js"]
