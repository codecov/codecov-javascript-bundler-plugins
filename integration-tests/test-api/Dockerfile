# syntax=docker/dockerfile:1
ARG BUILDPLATFORM=arm64
FROM --platform=$BUILDPLATFORM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY . .

RUN npm install -g pnpm
RUN pnpm install

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

USER hono
EXPOSE 8000
ENV PORT 8000

CMD ["pnpm", "run", "start"]
