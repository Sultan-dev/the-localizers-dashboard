# Builder stage
FROM node:23-alpine AS builder

WORKDIR /app

# Copy package files for caching
COPY package*.json ./
RUN npm install -g npm@11.6.1
RUN npm ci

# Copy entire project directory
COPY . .

# Build the project
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]