# Dockerfile para produção
FROM node:20-alpine AS base

# Instalar dependências necessárias
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar dependências
FROM base AS deps
RUN npm i pnpm -g
RUN pnpm install

# Build da aplicação
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Instalar pnpm global
RUN npm i pnpm -g

# Gerar Prisma Client (não precisa de DATABASE_URL)
RUN pnpm run db:generate

# Build do Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# Imagem de produção
FROM base AS runner
WORKDIR /app

# Instalar dependências necessárias para runtime
RUN apk add --no-cache netcat-openbsd

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar node_modules completo (necessário para prisma e tsx)
COPY --from=builder /app/node_modules ./node_modules

# Copiar arquivos necessários
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=base /app/package.json ./package.json

# Copiar script de entrypoint
COPY scripts/docker-entrypoint-prod.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint-prod.sh

# Mudar ownership dos arquivos
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["docker-entrypoint-prod.sh"]
CMD ["node", "server.js"]
