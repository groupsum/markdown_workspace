FROM node:20-alpine AS build

WORKDIR /app

COPY lander/package.json lander/package-lock.json ./

RUN npm ci

COPY lander/ ./

RUN npm run build

FROM nginx:1.27-alpine

COPY lander/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
