FROM node:20-alpine AS builder

WORKDIR /app/client

ARG VITE_OIDC_CLIENT_ID
ARG VITE_OIDC_FQDN
ARG VITE_OIDC_CALLBACK_PATH
ARG VITE_OIDC_FLOW

ENV VITE_OIDC_CLIENT_ID=$VITE_OIDC_CLIENT_ID \
  VITE_OIDC_FQDN=$VITE_OIDC_FQDN \
  VITE_OIDC_CALLBACK_PATH=$VITE_OIDC_CALLBACK_PATH \
  VITE_OIDC_FLOW=$VITE_OIDC_FLOW

COPY client/package.json client/package-lock.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

FROM nginx:1.27-alpine

COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
