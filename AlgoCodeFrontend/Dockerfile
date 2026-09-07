# Stage 1: Build Vite React app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build arguments for Vite environment variables
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_PROBLEM_SERVICE_BASE_URL=""
ARG VITE_SUBMISSION_SERVICE_BASE_URL=""
ARG VITE_SOCKET_URL=""

ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_PROBLEM_SERVICE_BASE_URL=$VITE_PROBLEM_SERVICE_BASE_URL
ENV VITE_SUBMISSION_SERVICE_BASE_URL=$VITE_SUBMISSION_SERVICE_BASE_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

RUN npm run build

# Stage 2: Serve static files with Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
