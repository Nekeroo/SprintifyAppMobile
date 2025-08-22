FROM node:22 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx expo export --platform web

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
