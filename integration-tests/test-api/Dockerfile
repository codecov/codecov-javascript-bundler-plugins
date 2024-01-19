# syntax=docker/dockerfile:1
# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1-alpine 
WORKDIR /usr/src/app

RUN apk update && apk upgrade
RUN apk add --no-cache sqlite

COPY . .
RUN bun install --frozen-lockfile

# run the app
USER bun
EXPOSE 8000
ENV PORT 8000
CMD [ "bun", "run", "src/index.ts" ]
