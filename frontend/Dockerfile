# Stage 1: Build the React Application
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Pass in the dynamic VITE_API_BASE_URL mapping for the reverse proxy
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx Reverse Proxy
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the built production assets from builder
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Nginx executes automatically via its base image CMD
