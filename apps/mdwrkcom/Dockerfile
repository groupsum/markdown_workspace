FROM node:20.19-alpine AS build

WORKDIR /workspace
COPY . .
RUN npm ci --ignore-scripts
RUN npm run build:renderer
RUN npm run build:lander:packages
RUN npm run ci:static -w @mdwrk/mdwrkcom

FROM nginx:1.27-alpine

COPY apps/mdwrkcom/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/apps/mdwrkcom/dist-static /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
