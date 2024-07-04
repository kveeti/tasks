FROM oven/bun:1 as pre
WORKDIR /www

FROM pre as deps
COPY package.json bun.lockb ./
RUN bun i --frozen-lockfile

FROM pre as build
COPY src src
COPY public public
# tsconfig is for the vite-tsconfig-paths plugin
COPY index.html tsconfig.json tsconfig.node.json vite.config.ts tailwind.config.js postcss.config.js package.json bun.lockb ./
COPY --from=deps /www/node_modules ./node_modules
ENV NODE_ENV=production

ARG API_URL
ENV VITE_APP_API_URL ${API_URL}

ARG VAPID_PUBLIC_KEY
ENV VITE_APP_VAPID_PUBLIC_KEY ${VAPID_PUBLIC_KEY}

RUN bun run build

FROM caddy:2.8.4 as runtime
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /www/dist /srv
ARG API_URL
ENV API_URL ${API_URL}
