# Build stage
FROM node:22 AS builder

WORKDIR /app

COPY package.json tsconfig.json ./
COPY src ./src
COPY public ./public
COPY config-overrides.js .
COPY start.sh .

RUN npm install && npm run build

# Runtime stage
FROM nginx:stable-alpine

RUN apk add --update --no-cache --virtual .tmp bash

EXPOSE 80

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=builder /app/build .
COPY --from=builder /app/start.sh .

RUN chmod +x /usr/share/nginx/html/start.sh
RUN chown nginx:nginx -R /usr/share/nginx/html /var/cache/nginx
RUN touch /var/run/nginx.pid && chown nginx:nginx /var/run/nginx.pid

USER nginx

ENTRYPOINT ["/usr/share/nginx/html/start.sh"]

CMD ["nginx", "-g", "daemon off;"]