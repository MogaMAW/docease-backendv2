FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN pnpm exec prisma migrate deploy
RUN pnpm exec prisma generate

ENV NODE_ENV=production

CMD ["pnpm", "start"]
