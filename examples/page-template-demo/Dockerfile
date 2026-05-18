FROM node:20.19-alpine AS build

WORKDIR /workspace
COPY . .
RUN npm ci --ignore-scripts
RUN npm run build:lander:packages
RUN npm run build -w @mdwrk/example-page-template-demo

FROM nginx:1.27-alpine

COPY examples/page-template-demo/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/examples/page-template-demo/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
