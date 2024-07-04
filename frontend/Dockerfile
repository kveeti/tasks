FROM node:22-alpine AS pre
WORKDIR /www
RUN corepack enable pnpm
RUN corepack prepare pnpm@latest --activate

FROM pre as deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile

FROM pre AS build
COPY src src
COPY public public
COPY index.html tsconfig.json rsbuild.config.ts tailwind.config.js postcss.config.js package.json pnpm-lock.yaml ./
COPY --from=deps /www/node_modules ./node_modules
ENV NODE_ENV=production
ARG API_URL
ENV PUBLIC_API_URL ${API_URL}
ARG VAPID_PUBLIC_KEY
ENV PUBLIC_VAPID_PUBLIC_KEY ${VAPID_PUBLIC_KEY}
RUN pnpm run build

FROM caddy:2.8.4 AS runtime
COPY --from=build /www/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
ARG API_URL
ENV API_URL ${API_URL}
