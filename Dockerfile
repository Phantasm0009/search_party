# Multi-stage build for Search Party app
FROM node:18-alpine AS frontend-build

# Build frontend
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .

# Copy production environment file first
COPY client/.env.production* ./

# Create build-time environment file that forces HTTP
RUN echo "HTTPS=false" > .env.production && \
    echo "GENERATE_SOURCEMAP=false" >> .env.production && \
    echo "PUBLIC_URL=" >> .env.production && \
    echo "REACT_APP_SERVER_URL=" >> .env.production && \
    echo "REACT_APP_GOOGLE_SEARCH_API_KEY=AIzaSyD63k6m7LW1uGUzKxtiZiw-LXAEfhCKh9k" >> .env.production && \
    echo "REACT_APP_GOOGLE_SEARCH_ENGINE_ID=4477262fb312f4305" >> .env.production && \
    echo "REACT_APP_ENABLE_REAL_SEARCH=true" >> .env.production && \
    echo "REACT_APP_ENABLE_ANALYTICS=false" >> .env.production

# Build with explicit HTTP settings
ENV NODE_ENV=production
ENV HTTPS=false
ENV GENERATE_SOURCEMAP=false
ENV PUBLIC_URL=

RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Install server dependencies
COPY server/package*.json ./
RUN npm install --only=production && npm cache clean --force

# Copy server code
COPY server/ .

# Copy built frontend from previous stage
COPY --from=frontend-build /app/client/build ./public

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S searchparty -u 1001
RUN chown -R searchparty:nodejs /app
USER searchparty

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
