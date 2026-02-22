# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

# Build sırasında telemetry kapatma
ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production Stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Start command with prisma migration
CMD ["sh", "-c", "npx prisma db push && npm start"]
