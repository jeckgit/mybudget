# Build stage
FROM node:20-slim AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy lockfile and package.json
COPY pnpm-lock.yaml package.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build stage environment
ARG SUPABASE_URL
ARG SUPABASE_KEY
ARG OPTIONAL_VERIFY_REDIRECT_URL
ARG VERIFY_EMAIL_FROM

ENV SUPABASE_URL=$SUPABASE_URL
ENV SUPABASE_KEY=$SUPABASE_KEY
ENV OPTIONAL_VERIFY_REDIRECT_URL=$OPTIONAL_VERIFY_REDIRECT_URL
ENV VERIFY_EMAIL_FROM=$VERIFY_EMAIL_FROM

# NOTE: Sensitive keys like SUPABASE_SERVICE_ROLE_KEY and RESEND_API_KEY 
# should be passed at RUNTIME (e.g. docker run -e ...) to keep them out of the image layers.

RUN pnpm build

# Runtime stage
FROM node:20-slim AS runner

WORKDIR /app

# Copy the build output from the builder stage
COPY --from=builder --chown=node:node /app/.output ./.output

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Switch to non-root user
USER node

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", ".output/server/index.mjs"]
