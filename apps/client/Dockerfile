FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_OIDC_CLIENT_ID
ARG VITE_OIDC_FQDN
ARG VITE_OIDC_CALLBACK_PATH

ENV VITE_OIDC_CLIENT_ID=$VITE_OIDC_CLIENT_ID \
  VITE_OIDC_FQDN=$VITE_OIDC_FQDN \
  VITE_OIDC_CALLBACK_PATH=$VITE_OIDC_CALLBACK_PATH

COPY package.json package-lock.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/client ./apps/client

RUN npm ci --install-strategy=nested
RUN npm run build:client

FROM nginx:1.27-alpine

COPY --from=builder /app/apps/client/dist /usr/share/nginx/html
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf
