# Build stage: Node 22 for proper worker_threads + Bun as package manager
FROM node:22-alpine AS build
WORKDIR /app

RUN npm install -g bun@1.3.12

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# Runtime stage
FROM nginx:1.27-alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
