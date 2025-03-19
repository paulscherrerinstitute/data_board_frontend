# Build stage
FROM node:22 AS builder

WORKDIR /app

COPY package.json .

RUN npm install

COPY tsconfig.json .
COPY tsconfig.app.json .
COPY tsconfig.node.json .
COPY index.html .
COPY vite.config.ts .
COPY src ./src
COPY public ./public

ARG NODE_OPTIONS=--max_old_space_size=4096
RUN npm run build

# Runtime stage
FROM nginx:stable-alpine

RUN apk add --update --no-cache --virtual .tmp bash

EXPOSE 80

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=builder /app/build .
COPY start.sh .

RUN chmod +x /usr/share/nginx/html/start.sh
RUN chown nginx:nginx -R /usr/share/nginx/html /var/cache/nginx
RUN touch /var/run/nginx.pid && chown nginx:nginx /var/run/nginx.pid

USER nginx

ENTRYPOINT ["/usr/share/nginx/html/start.sh"]

CMD ["nginx", "-g", "daemon off;"]
