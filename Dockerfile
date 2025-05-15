
FROM node:18-bullseye-slim AS builder
WORKDIR /app


COPY package*.json ./
RUN npm ci


COPY tsconfig*.json ./
COPY prisma ./prisma
COPY src ./src

RUN npx prisma generate


RUN npm run build


FROM node:18-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*


COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3003
ENTRYPOINT ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
