FROM node:18

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN pnpm run build

FROM nginx:1-alpine

COPY --from=0 /app/dist/ollama /usr/share/nginx/html
