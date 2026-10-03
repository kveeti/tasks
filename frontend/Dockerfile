FROM node:20-alpine AS build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm exec rsbuild build

FROM nginxinc/nginx-unprivileged:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY security-headers.conf /etc/nginx/security-headers.conf
COPY docker-entrypoint.d/40-config.sh /docker-entrypoint.d/40-config.sh
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
