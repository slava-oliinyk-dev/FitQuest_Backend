# 1. Build stage
FROM node:18-bullseye-slim AS builder
WORKDIR /app

# Устанавливаем зависимости
COPY package*.json ./
RUN npm ci

# Копируем остальной код
COPY tsconfig*.json ./
COPY prisma ./prisma
COPY src ./src

# Генерируем Prisma Client
RUN npx prisma generate

# Собираем TypeScript
RUN npm run build

# 2. Runtime stage
FROM node:18-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# (Опционально) если Prisma в рантайме жалуется на OpenSSL, можно:
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Копируем готовые файлы из builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3003
ENTRYPOINT ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
