# Build stage
FROM node:24-slim AS builder

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
COPY nginx.conf /etc/nginx/nginx.conf
COPY start.sh .
COPY default.conf /etc/nginx/conf.d/default.conf
COPY configure-backend-proxy.sh /configure-backend-proxy.sh

RUN chmod +x /usr/share/nginx/html/start.sh /configure-backend-proxy.sh

RUN chown nginx:nginx -R /usr/share/nginx/html /var/cache/nginx
RUN touch /var/run/nginx.pid && chown nginx:nginx /var/run/nginx.pid

ENTRYPOINT ["/usr/share/nginx/html/start.sh"]

CMD ["nginx", "-g", "daemon off;"]
