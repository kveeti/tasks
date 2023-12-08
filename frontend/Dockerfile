FROM oven/bun:1 as pre
WORKDIR /www

FROM pre as deps
COPY package.json bun.lockb ./
RUN bun i --frozen-lockfile

FROM pre as build
COPY src src
COPY public public
# tsconfig is for the vite-tsconfig-paths plugin
COPY .env index.html tsconfig.json tsconfig.node.json vite.config.ts tailwind.config.cjs postcss.config.js package.json bun.lockb ./
COPY --from=deps /www/node_modules ./node_modules
ENV NODE_ENV=production
RUN bun run build

FROM caddy:2.7.5 as runtime
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /www/dist /srv
