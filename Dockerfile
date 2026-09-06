# Build the static site, then ship only the built files. The previous image
# carried Node, the sources and node_modules to run `vite preview`, which is a
# dev server; this one is a static file server and about a fifth of the size.
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM caddy:2-alpine
COPY docker/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv

EXPOSE 5001
