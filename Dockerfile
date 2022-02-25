FROM node:16-alpine AS base
WORKDIR /var/bot

COPY package.json package-lock.json ./

RUN npm install

COPY . .

# RUNNER
FROM base AS production
WORKDIR /var/bot

RUN npm run build

RUN ls -la

EXPOSE 3000:3000

CMD ["node", "./dist/src/index.js"]