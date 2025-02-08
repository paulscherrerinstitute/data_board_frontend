FROM node:22 AS builder

WORKDIR /app

COPY package.json .

COPY package-lock.json .

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

RUN apk add --update --no-cache --virtual .tmp bash

EXPOSE 80

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=builder /app/build .

COPY --from=builder /app/start.sh .

RUN chmod +x /usr/share/nginx/html/start.sh

ENTRYPOINT ["/usr/share/nginx/html/start.sh"]

CMD ["nginx", "-g", "daemon off;"]