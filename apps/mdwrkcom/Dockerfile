FROM nginx:1.27-alpine

COPY apps/mdwrkcom/nginx.conf /etc/nginx/conf.d/default.conf
COPY apps/mdwrkcom/dist-static /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
