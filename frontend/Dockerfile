# ==============================================================================
# RoutineMate Frontend - Multi-stage Dockerfile
# ==============================================================================

# Stage 1: Build React App
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency definitions
COPY package.json package-lock.json* ./
RUN npm ci

# Copy frontend source files
COPY . ./

# Build production bundle
RUN npm run build

# Stage 2: Nginx Web Server
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Clean default nginx files
RUN rm -rf ./*

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
