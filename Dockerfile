# syntax=docker/dockerfile:1
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
# --omit=optional too: Better Auth lists vitest as an optional peer, which
# would otherwise keep the test runner in the image.
RUN npm run build && npm prune --omit=dev --omit=optional

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3001
COPY --from=build --chown=node:node /app/package.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
USER node
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD ["wget", "-qO-", "http://127.0.0.1:3001/healthz"]
CMD ["node", "dist/server.js"]
