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

COPY lander/package.json lander/package-lock.json ./

RUN npm ci

COPY lander/ ./

RUN npm run build

FROM nginx:1.27-alpine

COPY lander/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
