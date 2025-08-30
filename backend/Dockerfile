ARG NODE_VERSION=22.13.1

FROM node:${NODE_VERSION}-alpine

WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

# Prisma needs the schema at build and runtime
COPY prisma ./prisma
RUN npx prisma generate

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]

