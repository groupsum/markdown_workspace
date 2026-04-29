FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_DEMO_URL
ARG VITE_APP_URL
ARG VITE_GITHUB_URL
ARG VITE_X_URL
ARG VITE_COMMUNITY_URL
ARG VITE_GITHUB_REPO_URL
ARG VITE_NPM_REPO_URL
ARG VITE_NPM_CLIENT_VERSION
ARG VITE_SITE_URL

ENV VITE_DEMO_URL=$VITE_DEMO_URL \
  VITE_APP_URL=$VITE_APP_URL \
  VITE_GITHUB_URL=$VITE_GITHUB_URL \
  VITE_X_URL=$VITE_X_URL \
  VITE_COMMUNITY_URL=$VITE_COMMUNITY_URL \
  VITE_GITHUB_REPO_URL=$VITE_GITHUB_REPO_URL \
  VITE_NPM_REPO_URL=$VITE_NPM_REPO_URL \
  VITE_NPM_CLIENT_VERSION=$VITE_NPM_CLIENT_VERSION \
  VITE_SITE_URL=$VITE_SITE_URL

COPY package.json package-lock.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/lander ./apps/lander

RUN npm install --install-strategy=nested
RUN printf '#!/bin/sh\nnode /app/apps/lander/node_modules/typescript/bin/tsc "$@"\n' > /usr/local/bin/tsc && chmod +x /usr/local/bin/tsc
RUN npm run build:lander

FROM nginx:1.27-alpine

COPY apps/lander/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/lander/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
