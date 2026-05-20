FROM node:22-alpine AS deps
ARG CACHEBUST=1
WORKDIR /app
COPY package*.json ./
RUN echo "cachebust=${CACHEBUST}" && npm ci --include=dev

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run prisma:generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
