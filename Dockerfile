# Build stage
FROM node:22-alpine AS build

RUN npm install -g pnpm@10.20.0

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src

RUN pnpm install --frozen-lockfile
RUN pnpm prisma:generate
RUN pnpm build

# Runtime stage
FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

RUN npm install -g pnpm@10.20.0

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
