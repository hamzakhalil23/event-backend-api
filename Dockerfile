# ---- build stage: has dev deps + TypeScript compiler ----
FROM node:20-slim AS build
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci                                  # clean, lockfile-exact install (reproducible builds)
COPY prisma.config.ts ./
COPY prisma ./prisma
RUN npx prisma generate                     # generates the Prisma client
COPY . .
RUN npm run build                           # tsc -> dist/

# ---- runtime stage: only what's needed to run ----
FROM node:20-slim
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev                       # prod deps only (prisma + dotenv must be in "dependencies")
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma      
COPY --from=build /app/prisma.config.ts ./  
EXPOSE 8000
CMD ["node", "dist/index.js"]