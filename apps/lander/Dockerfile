FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_DEMO_URL
ARG VITE_GITHUB_URL
ARG VITE_X_URL
ARG VITE_COMMUNITY_URL
ARG VITE_GITHUB_REPO_URL
ARG VITE_NPM_REPO_URL

ENV VITE_DEMO_URL=$VITE_DEMO_URL \
  VITE_GITHUB_URL=$VITE_GITHUB_URL \
  VITE_X_URL=$VITE_X_URL \
  VITE_COMMUNITY_URL=$VITE_COMMUNITY_URL \
  VITE_GITHUB_REPO_URL=$VITE_GITHUB_REPO_URL \
  VITE_NPM_REPO_URL=$VITE_NPM_REPO_URL

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/client/package.json ./apps/client/package.json
COPY apps/lander/package.json ./apps/lander/package.json

RUN npm ci --workspace apps/lander

COPY apps/lander ./apps/lander

RUN npm run build --workspace apps/lander

FROM nginx:1.27-alpine

COPY apps/lander/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/lander/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
